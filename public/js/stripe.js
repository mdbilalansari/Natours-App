/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// const stripe = Stripe(
//   'pk_test_51Oaf8zSJ48uCZawy901Jp3ewszMLSnwWleWiwgbA3Rqu9YVAMWMMEM6C1Zl60Winq5QnpiLkrXXvt8pcORmwYOZx00AFLBNd9F'
// );

export const bookTour = async function(tourId) {
  try {
    // 1) Get the checkout sesion from the API
    const session = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    });

    // 2) Create checkout form + charge credit card
    await axios({
      method: 'GET',
      url: session.data.session.success_url
    });

    showAlert('success', 'Booking is successful');
  } catch (err) {
    console.error(err);
    showAlert('error', err.message);
  }
};
