
'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import Calendar from '../inputs/Calendar';

const initialDateRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
};

interface RoomReservationProps {
    listing: SafeListing & {
        user: SafeUser
    };
    reservations?: SafeReservation[];
    currentUser?: SafeUser | null
}

const RoomReservation: React.FC<RoomReservationProps> = ({
    listing,
    reservations = [],
    currentUser
}) => {
    const router = useRouter();

    const disabledDates = useMemo(() => {
        let dates: Date[] = [];

        reservations.forEach((reservation: any) => {
            const range = eachDayOfInterval({
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate)
            });

            dates = [...dates, ...range];
        });

        return dates;
    }, [reservations]);

    const [isLoading, setIsLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listing.price);
    const [dateRange, setDateRange] = useState<Range>(initialDateRange);

    const onCreateReservation = useCallback(() => {
        if (!currentUser) {
            // Yêu cầu người dùng đăng nhập
            toast.error('Bạn cần đăng nhập để thực hiện chức năng này.');
            return;
        }
        setIsLoading(true);

        'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInDays } from 'date-fns';
import axios from 'axios';
import { toast } from "react-hot-toast";

import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { DateTimePicker } from "./components/ui/date-time-picker";
import Button from '../Button';
import { BookingService } from "@/lib/booking-service";

interface RoomReservationProps {
    listing: SafeListing & {
        user: SafeUser
    };
    reservations?: SafeReservation[];
    currentUser?: SafeUser | null
}

const RoomReservation: React.FC<RoomReservationProps> = ({
    listing,
    reservations = [],
    currentUser
}) => {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [totalPrice, setTotalPrice] = useState(listing.price);
    const [checkInDate, setCheckInDate] = useState<Date | undefined>();
    const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
    const [selectedVoucher, setSelectedVoucher] = useState<string | undefined>();

    const handleCheckAvailability = useCallback(async () => {
        if (!checkInDate || !checkOutDate) {
            return;
        }

        setIsCheckingAvailability(true);
        try {
            const available = await BookingService.isRoomAvailable(
                listing.id,
                checkInDate.toISOString(),
                checkOutDate.toISOString()
            );
            setIsAvailable(available);
            if (available) {
                toast.success("Phòng có sẵn!");
            } else {
                toast.error("Phòng không có sẵn trong thời gian này.");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra khi kiểm tra phòng.");
        } finally {
            setIsCheckingAvailability(false);
        }
    }, [checkInDate, checkOutDate, listing.id]);


    const onCreateReservation = useCallback(() => {
        if (!currentUser) {
            toast.error('Bạn cần đăng nhập để thực hiện chức năng này.');
            return;
        }
        if (!isAvailable) {
            toast.error('Vui lòng kiểm tra phòng có sẵn trước khi đặt.');
            return;
        }
        setIsLoading(true);

        axios.post('/api/reservations', {
            totalPrice,
            startDate: checkInDate,
            endDate: checkOutDate,
            listingId: listing?.id,
            voucherId: selectedVoucher
        })
        .then(() => {
            toast.success('Đặt phòng thành công!');
            setCheckInDate(undefined);
            setCheckOutDate(undefined);
            setSelectedVoucher(undefined);
            setIsAvailable(false);
            router.push('/bookings');
        })
        .catch(() => {
            toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.');
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, [
        totalPrice,
        checkInDate,
        checkOutDate,
        listing?.id,
        router,
        currentUser,
        isAvailable,
        selectedVoucher
    ]);

    useEffect(() => {
        if (checkInDate && checkOutDate) {
            const dayCount = differenceInDays(
                checkOutDate,
                checkInDate
            );

            if (dayCount && listing.price) {
                setTotalPrice(dayCount * listing.price);
            } else {
                setTotalPrice(listing.price);
            }
        }
    }, [checkInDate, checkOutDate, listing.price]);

    return (
        <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
            <div className="flex flex-row items-center gap-1 p-4">
                <div className="text-2xl font-semibold">$ {listing.price}</div>
                <div className="font-light text-neutral-600">/ đêm</div>
            </div>
            <hr />
            <div className="p-4">
                <h3 className="font-semibold">Chọn ngày và giờ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Nhận phòng</label>
                        <DateTimePicker date={checkInDate} setDate={setCheckInDate} />
                    </div>
                    <div>
                        <label>Trả phòng</label>
                        <DateTimePicker date={checkOutDate} setDate={setCheckOutDate} />
                    </div>
                </div>
            </div>
            <hr />
            <div className="p-4">
                <h3 className="font-semibold">Chọn voucher</h3>
                {/* Placeholder for voucher selection */}
                <select
                    className="w-full p-2 border rounded"
                    value={selectedVoucher}
                    onChange={(e) => setSelectedVoucher(e.target.value)}
                >
                    <option value="">Không có voucher</option>
                    {/* Add voucher options here */}
                </select>
            </div>
            <hr />
            <div className="p-4">
                <Button
                    disabled={isCheckingAvailability || !checkInDate || !checkOutDate}
                    label={isCheckingAvailability ? "Đang kiểm tra..." : "Kiểm tra phòng trống"}
                    onClick={handleCheckAvailability}
                />
            </div>
            <div className="p-4">
                <Button
                    disabled={isLoading || !isAvailable}
                    label="Book Now"
                    onClick={onCreateReservation}
                />
            </div>
            <hr />
            <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
                <div>Tổng cộng</div>
                <div>$ {totalPrice}</div>
            </div>
        </div>
    );
}

export default RoomReservation;

    useEffect(() => {
        if (dateRange.startDate && dateRange.endDate) {
            const dayCount = differenceInDays(
                dateRange.endDate,
                dateRange.startDate
            );

            if (dayCount && listing.price) {
                setTotalPrice(dayCount * listing.price);
            } else {
                setTotalPrice(listing.price);
            }
        }
    }, [dateRange, listing.price]);

    return (
        <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
            <div className="flex flex-row items-center gap-1 p-4">
                <div className="text-2xl font-semibold">$ {listing.price}</div>
                <div className="font-light text-neutral-600">/ đêm</div>
            </div>
            <hr />
            <Calendar
                value={dateRange}
                disabledDates={disabledDates}
                onChange={(value) => setDateRange(value.selection)}
            />
            <hr />
            <div className="p-4">
                <Button
                    disabled={isLoading}
                    label="Book Now"
                    onClick={onCreateReservation}
                />
            </div>
            <hr />
            <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
                <div>Tổng cộng</div>
                <div>$ {totalPrice}</div>
            </div>
        </div>
    );
}

export default RoomReservation;