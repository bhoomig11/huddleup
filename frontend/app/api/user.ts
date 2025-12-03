import { withBase } from "./base";
import { getAuthToken } from "~/utils/auth";

function getAuthenticatedHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getAllUserBookings(username: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/booking`), {
    method: "GET",
    headers,
  });
  return response;
}

export async function fileComplaint(
  username: string,
  bookingId: number,
  subject: string,
  description: string
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(
    withBase(`/api/user/${username}/booking/${bookingId}/complaint`),
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        subject,
        description,
      }),
    }
  );
  return response;
}

export async function markComplaintAsResolved(
  username: string,
  bookingId: number
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(
    withBase(`/api/user/${username}/booking/${bookingId}/complaint/resolve`),
    {
      method: "PATCH",
      headers,
    }
  );
  return response;
}

export async function getAllCardDetails(username: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/cards`), {
    method: "GET",
    headers,
  });
  return response;
}

export async function addCardDetail(
  username: string,
  cardNumber: string,
  nameOnCard: string,
  expiryMonth: string,
  expiryYear: string,
  billingAddress: {
    streetLine1: string;
    streetLine2: string;
    town: string;
    state: string;
    zipcode: string;
  }
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/cards`), {
    method: "POST",
    headers,
    body: JSON.stringify({
      cardNumber,
      nameOnCard,
      expiryMonth,
      expiryYear,
      billingAddress,
    }),
  });
  return response;
}

export async function deleteCardDetail(username: string, cardId: number) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(
    withBase(`/api/user/${username}/cards/${cardId}`),
    {
      method: "DELETE",
      headers,
    }
  );
  return response;
}

export async function getUserProfile(username: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/profile`), {
    method: "GET",
    headers,
  });
  return response;
}

export async function updateUsername(username: string, newUsername: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/username`), {
    method: "PUT",
    headers,
    body: JSON.stringify({
      newUsername,
    }),
  });
  return response;
}

export async function updateEmail(username: string, newEmail: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/email`), {
    method: "PUT",
    headers,
    body: JSON.stringify({
      newEmail,
    }),
  });
  return response;
}

export async function updatePassword(username: string, newPassword: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}/password`), {
    method: "PUT",
    headers,
    body: JSON.stringify({
      password: newPassword,
    }),
  });
  return response;
}

export async function deleteUser(username: string) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(withBase(`/api/user/${username}`), {
    method: "DELETE",
    headers,
  });
  return response;
}

export async function updateUserProfile(
  username: string,
  profileUpdate: {
    firstName: string;
    lastName: string | null;
    birthDate: string | null;
    address: {
      streetLine1: string;
      streetLine2: string | null;
      town: string;
      state: string;
      zipcode: string;
    } | null;
  }
) {
  const headers = getAuthenticatedHeaders();

  // Convert to backend format
  const requestBody = {
    firstName: profileUpdate.firstName,
    lastName: profileUpdate.lastName || null,
    birthDate: profileUpdate.birthDate || null,
    address: profileUpdate.address
      ? {
          streetLine1: profileUpdate.address.streetLine1,
          streetLine2: profileUpdate.address.streetLine2 || null,
          town: profileUpdate.address.town,
          state: profileUpdate.address.state,
          zipcode: profileUpdate.address.zipcode,
        }
      : null,
  };

  const response = await fetch(withBase(`/api/user/${username}/profile`), {
    method: "PUT",
    headers,
    body: JSON.stringify(requestBody),
  });
  return response;
}

export async function getLatestUserTurfBooking(
  username: string,
  turfId: number
) {
  const headers = getAuthenticatedHeaders();

  const response = await fetch(
    withBase(`/api/user/${username}/booking?turfId=${turfId}&latest=true`),
    {
      method: "GET",
      headers,
    }
  );
  return response;
}
