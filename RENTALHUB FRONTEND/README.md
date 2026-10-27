# RentalHub web (Angular 20)

1. Install Node 20.19+ or 22, then in this folder run: `npm install`
2. Start your Spring Boot backend on http://localhost:8080
3. Run: `npm start`  and open http://localhost:4200

Backend URL: src/app/core/api.ts (API constant). CORS must allow http://localhost:4200 (already in your SecurityConfig).

Notes
- Payment uses the mock gateway (pay_ id + signature MOCK_SUCCESS). For Razorpay, open its checkout in checkout.page.ts using the order id and key from /initiate.
- Booking and admin tables show equipmentName if your BookingResponse includes it; otherwise they show the equipment id.
- If the backend is down, home and catalogue show sample items with a notice.
