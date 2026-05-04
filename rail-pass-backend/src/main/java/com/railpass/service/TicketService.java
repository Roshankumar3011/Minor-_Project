package com.railpass.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.railpass.model.Booking;
import com.railpass.model.Passenger;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class TicketService {

    public byte[] generateTicketPdf(Booking booking) throws Exception {
        String html = buildTicketHtml(booking);
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, "/");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        }
    }

    private String buildTicketHtml(Booking booking) {
        StringBuilder passengersHtml = new StringBuilder();
        List<Passenger> passengers = booking.getPassengers();
        
        for (int i = 0; i < passengers.size(); i++) {
            Passenger p = passengers.get(i);
            String status = p.getStatus().toString();
            // If it's the first passenger and replacement was done, note it
            String nameSuffix = (i == 0 && booking.getIsReplaced()) ? " (REPLACED)" : "";
            
            passengersHtml.append("  <tr>")
                .append("    <td>").append(i + 1).append("</td>")
                .append("    <td>").append(p.getName()).append(nameSuffix).append("</td>")
                .append("    <td>").append(p.getAge()).append("</td>")
                .append("    <td>").append(p.getGender()).append("</td>")
                .append("    <td>").append(status).append("</td>")
                .append("  </tr>");
        }

        // Add Nominee if replacement happened
        if (booking.getIsReplaced() && booking.getNominee() != null) {
            passengersHtml.append("  <tr style='background: #f0f7ff;'>")
                .append("    <td>*</td>")
                .append("    <td>").append(booking.getNominee().getName()).append(" (NOMINEE)</td>")
                .append("    <td>").append(booking.getNominee().getAge()).append("</td>")
                .append("    <td>").append(booking.getNominee().getGender()).append("</td>")
                .append("    <td>").append(booking.getNominee().getStatus()).append("</td>")
                .append("  </tr>");
        }

        return "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: Arial, sans-serif; margin: 20px; color: #333; }" +
                ".header { border-bottom: 2px solid #0052cc; padding-bottom: 10px; margin-bottom: 20px; }" +
                ".header h1 { color: #0052cc; margin: 0; font-size: 24px; }" +
                ".header p { margin: 5px 0; color: #666; font-size: 14px; }" +
                ".info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }" +
                ".info-box { border: 1px solid #ddd; padding: 10px; width: 48%; }" +
                "table { width: 100%; border-collapse: collapse; margin-top: 20px; }" +
                "th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }" +
                "th { background-color: #f2f2f2; font-weight: bold; }" +
                ".footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }" +
                ".pnr-badge { background: #e6f0ff; color: #0052cc; padding: 5px 10px; border-radius: 4px; font-weight: bold; }" +
                "</style></head><body>" +
                "<div class='header'>" +
                "  <div style='float: right; text-align: right;'>" +
                "    <h2 style='margin:0'>RailPass Connect</h2>" +
                "    <p>e-Ticket (Electronic Reservation Slip)</p>" +
                "  </div>" +
                "  <h1>INDIAN RAILWAYS</h1>" +
                "  <p>Official Ticketing Partner</p>" +
                "</div>" +
                "<div style='clear: both;'></div>" +
                "<table>" +
                "  <tr><th colspan='4' style='background: #0052cc; color: white;'>JOURNEY DETAILS</th></tr>" +
                "  <tr>" +
                "    <td><b>PNR Number:</b></td><td><span class='pnr-badge'>" + booking.getPnr() + "</span></td>" +
                "    <td><b>Train Number/Name:</b></td><td>" + booking.getTrain().getTrainNumber() + " / " + booking.getTrain().getName() + "</td>" +
                "  </tr>" +
                "  <tr>" +
                "    <td><b>From Station:</b></td><td>" + booking.getTrain().getSource() + "</td>" +
                "    <td><b>To Station:</b></td><td>" + booking.getTrain().getDestination() + "</td>" +
                "  </tr>" +
                "  <tr>" +
                "    <td><b>Date of Journey:</b></td><td>" + booking.getJourneyDate().toString() + "</td>" +
                "    <td><b>Booking Date:</b></td><td>" + booking.getBookingDate().toString() + "</td>" +
                "  </tr>" +
                "</table>" +
                "<table>" +
                "  <tr><th colspan='5' style='background: #0052cc; color: white;'>PASSENGER DETAILS</th></tr>" +
                "  <tr>" +
                "    <th>SNo.</th><th>Name</th><th>Age</th><th>Gender</th><th>Status</th>" +
                "  </tr>" +
                passengersHtml.toString() +
                "</table>" +
                "<div style='margin-top: 20px; border: 1px dashed #0052cc; padding: 15px; background: #fafafa;'>" +
                "  <h4 style='margin:0 0 10px 0; color: #0052cc;'>Important Instructions:</h4>" +
                "  <ul style='font-size: 11px; color: #555; margin: 0;'>" +
                "    <li>Please carry an original ID proof during the journey.</li>" +
                "    <li>This e-ticket is valid only with a valid photo ID proof.</li>" +
                "    <li>Total Fare: ₹" + booking.getFare() + "</li>" +
                "  </ul>" +
                "</div>" +
                "<div class='footer'>" +
                "  <p>Generated by RailPass Connect on " + java.time.LocalDateTime.now() + "</p>" +
                "  <p>Wishing you a safe and happy journey!</p>" +
                "</div>" +
                "</body></html>";
    }
}
