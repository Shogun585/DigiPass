from typing import Optional
import datetime

from sqlalchemy import CheckConstraint, Date, Enum, ForeignKeyConstraint, Index, Integer, String, TIMESTAMP, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Users(Base):
    __tablename__ = 'users'

    id: Mapped[str] = mapped_column(String(25), primary_key=True)
    password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(20), nullable=False)
    last_name: Mapped[str] = mapped_column(String(20), nullable=False)
    role: Mapped[str] = mapped_column(Enum('student', 'warden', 'guard', 'other'), nullable=False)
    contact_details: Mapped[Optional[str]] = mapped_column(String(50))

    leave_pass: Mapped[list['LeavePass']] = relationship('LeavePass', back_populates='college')
    # logs: Mapped[list['Logs']] = relationship('Logs', back_populates='staff')


class LeavePass(Base):
    __tablename__ = 'leave_pass'
    __table_args__ = (
        CheckConstraint('(`leave_start` <= `leave_end`)', name='chk_leaveend_more_leavestart'),
        ForeignKeyConstraint(['college_id'], ['users.id'], name='leave_pass_ibfk_1'),
        Index('college_id', 'college_id')
    )

    pass_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    college_id: Mapped[str] = mapped_column(String(25), nullable=False)
    pass_type: Mapped[str] = mapped_column(Enum('leave', 'market', 'other'), nullable=False)
    leave_start: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    leave_end: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    pass_status: Mapped[Optional[str]] = mapped_column(Enum('pending', 'approved', 'rejected'), server_default=text("'pending'"))
    request_time: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    college: Mapped['Users'] = relationship('Users', back_populates='leave_pass')
    # logs: Mapped[list['Logs']] = relationship('Logs', back_populates='pass_')


# THIS IS FOR FUTURE PURPOSES WHEN I NEED TO SCALE THE APPLICATION TO A LEVEL
# WHERE I NEED TO KEEP RECORD OF STUDENT STATUS FOR HIM TO EVEN BE ALLOWED TO APPLY FOR PASS AND TO MAINTAIN A LOG OF ENTRIES/EXITS

# class Logs(Base):
#     __tablename__ = 'logs'
#     __table_args__ = (
#         ForeignKeyConstraint(['pass_id'], ['leave_pass.pass_id'], name='logs_ibfk_1'),
#         ForeignKeyConstraint(['staff_id'], ['users.id'], name='logs_ibfk_2'),
#         Index('pass_id', 'pass_id'),
#         Index('staff_id', 'staff_id')
#     )

#     action: Mapped[str] = mapped_column(Enum('checked in', 'checked out', 'scan'), nullable=False)
#     scan_id: Mapped[int] = mapped_column(Integer, primary_key=True)
#     pass_id: Mapped[int] = mapped_column(Integer, nullable=False)
#     staff_id: Mapped[str] = mapped_column(String(25), nullable=False)
#     scan_time: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
#     student_status: Mapped[Optional[str]] = mapped_column(Enum('out', 'in', 'market'), server_default=text("'in'"))

#     pass_: Mapped['LeavePass'] = relationship('LeavePass', back_populates='logs')
#     staff: Mapped['Users'] = relationship('Users', back_populates='logs')
