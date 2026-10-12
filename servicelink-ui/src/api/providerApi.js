import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
} from "./authApi.js";

const API_BASE =
  "http://127.0.0.1:8000/api/provider";

export function getAuthenticatedProviderId() {
  const user = getStoredUser();

  if (
    !user ||
    user.role !== "provider" ||
    !user.public_id
  ) {
    const error = new Error(
      "A logged-in provider account is required."
    );

    error.status = 401;
    throw error;
  }

  return user.public_id;
}

async function apiRequest(path, options = {}) {
    const token = getAuthToken();

    if (!token) {
        clearAuthSession();

        const error = new Error(
            "Your session has expired. Please log in again."
        );

        error.status = 401;
        throw error;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    const contentType = response.headers.get("content-type") || "";

    let result = null;

    if (contentType.includes("application/json")) {
        result = await response.json();
    }

    if (response.status === 401) {
        clearAuthSession();
    }
    if (!response.ok) {
        const error = new Error(
            result?.message || "The ServiceLink request failed."
        );

        error.status = response.status;
        error.errors = result?.errors || null;
        error.data = result?.data || null;

        throw error;
    }

    return result;
}

export function getProviderProfile(
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(`/profiles/${providerPublicId}`);
}

export function updateProviderProfile(
    profileData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(`/profiles/${providerPublicId}`, {
        method: "PUT",
        body: JSON.stringify(profileData),
    });
}

export function getProviderApplication(
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(`/application/${providerPublicId}`);
}

export function submitProviderApplication(
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(`/application/${providerPublicId}/submit`, {
        method: "POST",
        body: JSON.stringify({
            declaration_accepted: true,
        }),
    });
}

export function getProviderQualifications(
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/application/${providerPublicId}/qualifications`
    );
}

export function createProviderQualification(
    formData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/application/${providerPublicId}/qualifications`,
        {
            method: "POST",
            body: formData,
        }
    );
}

export function updateProviderQualification(
    qualificationPublicId,
    formData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/application/${providerPublicId}/qualifications/` +
        `${qualificationPublicId}/update`,
        {
            method: "POST",
            body: formData,
        }
    );
}

export function deleteProviderQualification(
    qualificationPublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/application/${providerPublicId}/qualifications/` +
        qualificationPublicId,
        {
            method: "DELETE",
        }
    );
}

export function getQualificationPreviewUrl(
    qualificationPublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return (
        `${API_BASE}/application/${providerPublicId}/qualifications/` +
        `${qualificationPublicId}/preview`
    );
}

export function getQualificationDownloadUrl(
    qualificationPublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return (
        `${API_BASE}/application/${providerPublicId}/qualifications/` +
        `${qualificationPublicId}/download`
    );
}
export function getServiceCategories() {
    return apiRequest("/service-categories");
}

export function getProviderServices(
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/services/${providerPublicId}`
    );
}

export function getProviderService(
    servicePublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/services/${providerPublicId}/${servicePublicId}`
    );
}

export function createProviderService(
    serviceData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/services/${providerPublicId}`,
        {
            method: "POST",
            body: JSON.stringify(serviceData),
        }
    );
}

export function updateProviderService(
    servicePublicId,
    serviceData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/services/${providerPublicId}/${servicePublicId}`,
        {
            method: "PUT",
            body: JSON.stringify(serviceData),
        }
    );
}

export function toggleProviderServiceStatus(
    servicePublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/services/${providerPublicId}/${servicePublicId}/toggle-status`,
        {
            method: "POST",
        }
    );
}

export function getProviderAvailability(
providerPublicId = getAuthenticatedProviderId()
) {
return apiRequest(
`/availability/${providerPublicId}`
);
}

export function createProviderAvailability(
    slotData,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/availability/${providerPublicId}`,
        {
            method: "POST",
            body: JSON.stringify(slotData),
        }
    );
}

export function deleteProviderAvailability(
    slotPublicId,
    providerPublicId = getAuthenticatedProviderId()
) {
    return apiRequest(
        `/availability/${providerPublicId}/${slotPublicId}`,
        {
            method: "DELETE",
        }
    );
}
export function getProviderWantedAds(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/wanted-ads/${providerPublicId}`
  );
}

export function getProviderWantedAd(
  wantedAdPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/wanted-ads/${providerPublicId}/${wantedAdPublicId}`
  );
}

export function getProviderOffers(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/offers/${providerPublicId}`
  );
}

export function getProviderOffer(
  offerPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/offers/${providerPublicId}/${offerPublicId}`
  );
}

export function createProviderOffer(
  wantedAdPublicId,
  offerData,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/wanted-ads/${providerPublicId}/${wantedAdPublicId}/offers`,
    {
      method: "POST",
      body: JSON.stringify(offerData),
    }
  );
}

export function updateProviderOffer(
  offerPublicId,
  offerData,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/offers/${providerPublicId}/${offerPublicId}`,
    {
      method: "PUT",
      body: JSON.stringify(offerData),
    }
  );
}

export function withdrawProviderOffer(
  offerPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/offers/${providerPublicId}/${offerPublicId}/withdraw`,
    {
      method: "POST",
    }
  );
}

export function getProviderBookings(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/bookings/${providerPublicId}`
  );
}

export function getProviderBookingRequests(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/bookings/${providerPublicId}/requests`
  );
}

export function getProviderBooking(
  bookingPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/bookings/${providerPublicId}/${bookingPublicId}`
  );
}

export function updateProviderBookingStatus(
  bookingPublicId,
  action,
  note = "",
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/bookings/${providerPublicId}/${bookingPublicId}/status`,
    {
      method: "POST",
      body: JSON.stringify({
        action,
        note,
      }),
    }
  );
}
export function getProviderEarnings(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/earnings/${providerPublicId}`
  );
}
export function getProviderReviews(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/reviews/${providerPublicId}`
  );
}
export function getProviderComplaints(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/complaints/${providerPublicId}`
  );
}

export function getProviderComplaint(
  complaintPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/complaints/${providerPublicId}/${complaintPublicId}`
  );
}

export function saveProviderComplaintResponse(
  complaintPublicId,
  responseText,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/complaints/${providerPublicId}/${complaintPublicId}/response`,
    {
      method: "POST",
      body: JSON.stringify({
        response_text: responseText,
      }),
    }
  );
}
export function getProviderNotifications(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/notifications/${providerPublicId}`
  );
}

export function markProviderNotificationAsRead(
  notificationPublicId,
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/notifications/${providerPublicId}/${notificationPublicId}/read`,
    {
      method: "POST",
    }
  );
}

export function markAllProviderNotificationsAsRead(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/notifications/${providerPublicId}/read-all`,
    {
      method: "POST",
    }
  );
}
export function getProviderStatistics(
  providerPublicId = getAuthenticatedProviderId()
) {
  return apiRequest(
    `/statistics/${providerPublicId}`
  );
}