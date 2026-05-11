package com.railpass.controller;

import com.railpass.dto.BookingRequest;
import com.railpass.dto.ReplacementRequest;
import com.railpass.model.Booking;
import com.railpass.service.BookingService;
import com.railpass.service.ReplacementService;
import com.railpass.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingService bookingService;
    @Autowired
    private ReplacementService replacementService;
    @Autowired
    private TicketService ticketService;

    @PostMapping("/book")
    public ResponseEntity<Booking> book(@RequestBody BookingRequest request) {
        System.out.println("Booking Request Received for user ID: " + request.getUserId());
        return ResponseEntity.ok(bookingService.bookTicket(request));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Booking>> history(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingHistory(userId));
    }

    @PostMapping("/cancel/{pnr}")
    public ResponseEntity<String> cancel(@PathVariable String pnr) {
        try {
            bookingService.cancelTicket(pnr);
            return ResponseEntity.ok("Ticket cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cancel/{pnr}/passenger/{passengerId}")
    public ResponseEntity<String> cancelPassenger(@PathVariable String pnr, @PathVariable Long passengerId) {
        try {
            bookingService.cancelSinglePassenger(pnr, passengerId);
            return ResponseEntity.ok("Passenger cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{pnr}")
    public ResponseEntity<Booking> getTicket(@PathVariable String pnr) {
        return ResponseEntity.ok(bookingService.getBookingByPnr(pnr));
    }

    @GetMapping("/ticket/pdf/{pnr}")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable String pnr) {
        try {
            Booking booking = bookingService.getBookingByPnr(pnr);
            byte[] pdf = ticketService.generateTicketPdf(booking);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=Ticket_" + pnr + ".pdf")
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PostMapping("/replace")
    public ResponseEntity<String> replace(@RequestBody ReplacementRequest request) {
        try {
            String result = replacementService.replacePassenger(request.getPnr(), request.getOtp(), request.getPassengerId());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

