package com.psiqapp.adapter.out.google;

import com.google.api.services.calendar.Calendar;

@FunctionalInterface
interface GoogleCalendarServiceFactory {
    Calendar criar(String refreshToken);
}
