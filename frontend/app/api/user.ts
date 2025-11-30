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

