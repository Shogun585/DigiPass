const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = process.env.NEON_STORAGE_BUCKET || 'student-photos';

// Check if Neon Object Storage credentials exist
const isNeonConfigured = () => {
    return Boolean(
        process.env.NEON_STORAGE_ENDPOINT &&
        process.env.NEON_ACCESS_KEY_ID &&
        process.env.NEON_SECRET_ACCESS_KEY
    );
};

// Check if Supabase credentials exist
const isSupabaseConfigured = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'));
};

// Initialize S3 client lazily or when configured
let s3ClientInstance = null;
const getS3Client = () => {
    if (!s3ClientInstance && isNeonConfigured()) {
        s3ClientInstance = new S3Client({
            endpoint: process.env.NEON_STORAGE_ENDPOINT,
            region: process.env.NEON_STORAGE_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.NEON_ACCESS_KEY_ID,
                secretAccessKey: process.env.NEON_SECRET_ACCESS_KEY,
            },
            forcePathStyle: true, // Required for Neon S3 compatibility
        });
    }
    return s3ClientInstance;
};

// Initialize Supabase client lazily
let supabaseClientInstance = null;
const getSupabaseClient = () => {
    if (!supabaseClientInstance && isSupabaseConfigured()) {
        supabaseClientInstance = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }
    return supabaseClientInstance;
};

/**
 * Sanitizes photo path to extract clean filename
 * @param {string} filePath 
 * @returns {string|null}
 */
const sanitizeFilePath = (filePath) => {
    if (!filePath) return null;
    let cleanPath = filePath.trim();
    if (cleanPath.startsWith('http')) {
        const urlParts = cleanPath.split('/');
        cleanPath = urlParts[urlParts.length - 1];
    }
    return cleanPath.replace(/^\/+/, '');
};

/**
 * Uploads a student photo buffer to Neon S3 (or Supabase fallback)
 * @param {string} fileName 
 * @param {Buffer} fileBuffer 
 * @param {string} mimeType 
 * @returns {Promise<{ success: boolean, fileName: string, provider: string }>}
 */
const uploadStudentPhoto = async (fileName, fileBuffer, mimeType) => {
    const cleanKey = sanitizeFilePath(fileName);

    // Primary: Neon Object Storage
    if (isNeonConfigured()) {
        try {
            const s3Client = getS3Client();
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: cleanKey,
                Body: fileBuffer,
                ContentType: mimeType,
            });
            await s3Client.send(command);
            return { success: true, fileName: cleanKey, provider: 'neon' };
        } catch (neonErr) {
            console.error('[Neon Storage] Upload error:', neonErr);
            // Fallback to Supabase if available
            if (isSupabaseConfigured()) {
                console.warn('[Storage] Falling back to Supabase for upload...');
                const supabase = getSupabaseClient();
                const { error } = await supabase.storage
                    .from('student-photos')
                    .upload(cleanKey, fileBuffer, {
                        contentType: mimeType,
                        upsert: true,
                    });
                if (error) {
                    throw new Error(`Supabase fallback upload failed: ${error.message}`);
                }
                return { success: true, fileName: cleanKey, provider: 'supabase-fallback' };
            }
            throw neonErr;
        }
    }

    // Secondary: Supabase Storage
    if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        const { error } = await supabase.storage
            .from('student-photos')
            .upload(cleanKey, fileBuffer, {
                contentType: mimeType,
                upsert: true,
            });
        if (error) {
            console.error('[Supabase Storage] Upload error:', error);
            throw new Error(`Supabase upload failed: ${error.message}`);
        }
        return { success: true, fileName: cleanKey, provider: 'supabase' };
    }

    throw new Error('No storage provider is configured. Please configure Neon Storage or Supabase credentials.');
};

/**
 * Generates a presigned URL to view a student photo
 * @param {string} filePath 
 * @param {number} expiresInSeconds 
 * @returns {Promise<string|null>}
 */
const getStudentPhotoSignedUrl = async (filePath, expiresInSeconds = 60) => {
    const cleanKey = sanitizeFilePath(filePath);
    if (!cleanKey) return null;

    // Primary: Neon Object Storage
    if (isNeonConfigured()) {
        try {
            const s3Client = getS3Client();
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: cleanKey,
            });
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
            return signedUrl;
        } catch (neonErr) {
            console.error('[Neon Storage] Presigned URL error:', neonErr);
            // Fallback to Supabase if configured
            if (isSupabaseConfigured()) {
                const supabase = getSupabaseClient();
                const { data } = await supabase.storage
                    .from('student-photos')
                    .createSignedUrl(cleanKey, expiresInSeconds);
                if (data?.signedUrl) return data.signedUrl;
            }
            return null;
        }
    }

    // Secondary: Supabase Storage
    if (isSupabaseConfigured()) {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.storage
                .from('student-photos')
                .createSignedUrl(cleanKey, expiresInSeconds);

            if (error) {
                console.error('[Supabase Storage] Presigned URL error:', error);
                return null;
            }
            return data?.signedUrl || null;
        } catch (err) {
            console.error('[Supabase Storage] Error:', err);
            return null;
        }
    }

    return null;
};

/**
 * Downloads a photo from Supabase Storage (used by migration script)
 * @param {string} filePath 
 * @returns {Promise<{ buffer: Buffer, mimeType: string }>}
 */
const downloadPhotoFromSupabase = async (filePath) => {
    const cleanKey = sanitizeFilePath(filePath);
    if (!cleanKey) throw new Error('File path required');

    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase.storage
        .from('student-photos')
        .download(cleanKey);

    if (error) {
        throw new Error(`Failed to download from Supabase: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return {
        buffer: Buffer.from(arrayBuffer),
        mimeType: data.type || 'image/jpeg',
    };
};

module.exports = {
    isNeonConfigured,
    isSupabaseConfigured,
    sanitizeFilePath,
    uploadStudentPhoto,
    getStudentPhotoSignedUrl,
    downloadPhotoFromSupabase,
    BUCKET_NAME,
};
