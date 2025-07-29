import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Dropdown,
  Card,
} from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

import cashIcon from "../assets/cash.png";
import khaltiIcon from "../assets/khalti.png";
import onlineIcon from "../assets/online.png";

const BookingPage = () => {
  const { hotelId } = useParams();
  const { customerId, email: customerEmail } = useAuth();

  const [hotel, setHotel] = useState({});
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numRooms, setNumRooms] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // map your methods to icons & labels
  const icons = {
    cash: cashIcon,
    khalti: khaltiIcon,
    banking: onlineIcon,
  };
  const labels = {
    cash: "Cash",
    khalti: "Khalti",
    banking: "Online Banking",
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/hotels/${hotelId}`)
      .then((res) => {
        setHotel({
          ...res.data,
          images: res.data.images
            ? res.data.images.map((img) =>
                img.startsWith("http")
                  ? img
                  : `http://localhost:5000/hotel_images/${img}`
              )
            : [],
        });
      })
      .catch((err) => console.error("Error fetching hotel:", err));
  }, [hotelId]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const calculatedTotal = hotel.pricePerNight * numRooms;
    setTotalPrice(calculatedTotal);

    const bookingData = {
      customerId,
      customerEmail,
      hotelId: hotel._id,
      hotelName: hotel.name,
      checkInDate,
      checkOutDate,
      numRooms,
      totalPrice: calculatedTotal,
      paymentMethod,
    };

    // Validation: Check for missing or invalid fields
    if (!bookingData.customerId || !bookingData.customerEmail || !bookingData.hotelId || !bookingData.hotelName || !bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.numRooms || !bookingData.totalPrice || !bookingData.paymentMethod) {
      toast.error("All fields are required. Please fill in all details and make sure you are logged in.");
      console.error("Booking validation failed:", bookingData);
      return;
    }
    if (!["cash", "esewa", "banking"].includes(bookingData.paymentMethod)) {
      toast.error("Invalid payment method selected.");
      return;
    }

    console.log("Booking data being sent:", bookingData);

    try {
      await axios.post("http://localhost:5000/api/booking", bookingData);
      toast.success("Booking successful!");
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking failed. Please try again.");
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      <h2 className="mb-4 text-center">Book Your Hotel for {hotel.name}</h2>

      <Row className="my-4">
        <Col>
          <Card>
            <Card.Img
              variant="top"
              src={
                hotel.images && hotel.images.length
                  ? hotel.images[0]
                  : "https://via.placeholder.com/600x400"
              }
              alt={hotel.name}
              className="img-fluid rounded"
              style={{ objectFit: "cover", width: "100%", height: "200px" }}
            />
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={8}>
          <h4>{hotel.name}</h4>
          <p>{hotel.location}</p>
          <p>
            <strong>NPR {hotel.pricePerNight}</strong> per person
          </p>
        </Col>
      </Row>

      <Form onSubmit={handleBooking}>
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="checkInDate">
              <Form.Label>Check-in Date</Form.Label>
              <Form.Control
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="checkOutDate">
              <Form.Label>Check-out Date</Form.Label>
              <Form.Control
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="numRooms">
              <Form.Label>Number of Persons</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={numRooms}
                onChange={(e) => setNumRooms(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group controlId="paymentMethod" className="mt-4">
          <Form.Label>Payment Method</Form.Label>
          <Dropdown
            onSelect={(key) => setPaymentMethod(key)}
            className="d-flex align-items-center"
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px",
            }}
          >
            <Dropdown.Toggle
              variant="light"
              id="payment-method-dropdown"
              className="w-100"
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={icons[paymentMethod]}
                  alt={paymentMethod}
                  style={{ width: "24px", marginRight: "10px" }}
                />
                {labels[paymentMethod]}
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="cash">
                <img
                  src={cashIcon}
                  alt="Cash"
                  style={{
                    width: "32px",
                    height: "32px",
                    marginRight: "10px",
                  }}
                />
                Cash
              </Dropdown.Item>
              <Dropdown.Item eventKey="khalti">
                <img
                  src={khaltiIcon}
                  alt="Khalti"
                  style={{
                    width: "32px",
                    height: "32px",
                    marginRight: "10px",
                  }}
                />
                Khalti
              </Dropdown.Item>
              <Dropdown.Item eventKey="banking">
                <img
                  src={onlineIcon}
                  alt="Online Banking"
                  style={{
                    width: "32px",
                    height: "32px",
                    marginRight: "10px",
                  }}
                />
                Online Banking
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>

        <h4 className="mt-3 text-center">
          Total Price: <strong>NPR {totalPrice}</strong>
        </h4>

        <Button
          type="submit"
          variant="primary"
          className="w-100 mt-4"
          style={{ padding: "12px 0", borderRadius: "8px" }}
        >
          Confirm Booking
        </Button>
      </Form>

      <ToastContainer />
    </Container>
  );
};

export default BookingPage;
