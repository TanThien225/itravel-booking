import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

BookingWidget.propTypes = {
  place: PropTypes.shape({
    price: PropTypes.number.isRequired,
    // Add other properties if needed
  }).isRequired,
};

export default function BookingWidget({ place }) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [nameCustomer, setNameCustomer] = useState("");
  const [phoneNumber, setMobile] = useState("");
  const [redirect, setRedirect] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setNameCustomer(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkInDate && checkOutDate) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOutDate),
      new Date(checkInDate)
    );
  }

  async function bookingThisPlace() {
    const response = await axios.post('/bookings', {
      checkInDate,checkOutDate,numberOfGuests,nameCustomer,phoneNumber,
      // eslint-disable-next-line react/prop-types
      place:place._id,
      price:numberOfNights * place.price,
    });
    const bookingId = response.data._id;
    setRedirect(`/account/bookings/${bookingId}`);
  }


  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow-xl p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Chi phí:{" "}
        <span className="font-semibold">
          {place.price.toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
          })}
        </span>{" "}
        VNĐ/ đêm
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4">
            <label>Ngày nhận phòng:</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(event) => setCheckInDate(event.target.value)}
            ></input>
          </div>
          <div className="py-3 px-4 border-l">
            <label>Ngày trả phòng:</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(event) => setCheckOutDate(event.target.value)}
            ></input>
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Khách</label>
          <input
            className="remove-arrow"
            type="number"
            value={numberOfGuests}
            onChange={(event) => setNumberOfGuests(event.target.value)}
          ></input>
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Họ và tên của bạn: </label>
            <input
              type="text"
              value={nameCustomer}
              onChange={(event) => setNameCustomer(event.target.value)}
            ></input>
            <label>SĐT: </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setMobile(event.target.value)}
            ></input>
          </div>
        )}
      </div>
      <button onClick={bookingThisPlace} className="primary mt-4">
        Đặt phòng
        {numberOfNights > 0 && (
          <span>
            {" "}
            {(numberOfNights * place.price).toLocaleString("vi-VN", {
              minimumFractionDigits: 0,
            })}{" "}
            VNĐ
          </span>
        )}
      </button>
    </div>
  );
}
