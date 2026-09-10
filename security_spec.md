# Security Specification for College Canteen Food Ordering System

## 1. Data Invariants
1. **User Identity & Role Separation**: Only authorized canteen administrators can assign the `admin` role or manage canteen operational data. Regular students can only register as `student`.
2. **Order Ownership**: An order can only be created by an authenticated user where `incoming().userId == request.auth.uid`. Students can only query and read their own orders; canteen staff / admins can view all orders.
3. **Order Status Lifecycle**: Students may only cancel an order if it is in `pending` status. Only canteen staff / admins can transition orders through `accepted` -> `preparing` -> `ready` -> `completed` / `rejected`.
4. **Menu & Category Integrity**: Public menu and categories can be read by anyone, but only canteen staff / admins can create, modify, delete, or toggle availability of food items and categories.
5. **PII Isolation**: Student profiles containing email, phone, and roll number are readable only by the profile owner or canteen administrators.
6. **Canteen Capacity Settings**: Anyone can read the general canteen setting (e.g. `acceptingOrders`), but only administrators can alter canteen availability.

## 2. The "Dirty Dozen" Payloads (Audited for Rejection)
1. **Unauthenticated Order Creation**: Attempting to create an order without an active auth token. (*Rejected: Auth Required*)
2. **Order Impersonation**: Authenticated user `A` creating an order with `userId: "user_B"`. (*Rejected: Identity Integrity*)
3. **Self-Promoted Admin**: Registering a user document with `role: "admin"` as a non-admin. (*Rejected: Role Escalation Guard*)
4. **Student Tampering with Menu**: Student attempting to update food price or availability in `foodItems/{foodId}`. (*Rejected: Admin Only*)
5. **Cross-User Order Reading**: Student `A` listing orders created by Student `B`. (*Rejected: Secure List Evaluation `resource.data.userId == request.auth.uid`*)
6. **Unauthorized Order Status Shift**: Student changing order status from `pending` straight to `completed`. (*Rejected: Only admin or cancellation permitted*)
7. **Junk Path ID Injection**: Injecting a 2KB non-alphanumeric document ID into `orders/{orderId}`. (*Rejected: `isValidId` Regex & Length*)
8. **Shadow Field Injection**: Adding unexpected arbitrary fields like `{ backdoor: true }` in order payload. (*Rejected: Schema validation helper*)
9. **Student Modifying Canteen Capacity**: Student turning off `acceptingOrders` toggle. (*Rejected: Admin Only*)
10. **Tampering with Payment Records**: Normal student modifying payment status of another user. (*Rejected: Admin Only*)
11. **Student Deleting Menu Items**: Normal student deleting food items or categories. (*Rejected: Admin Only*)
12. **Student Modifying Admin Collection**: Normal user writing to `admins/{adminId}`. (*Rejected: Admin Only*)
