import { withBase } from "./base";
import { getAuthToken } from "~/utils/auth";

export async function getAllUserBookings(username: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is required");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(withBase(`/api/user/${username}/cards/${cardId}`), {
    method: "DELETE",
    headers,
  });
  return response;
}

