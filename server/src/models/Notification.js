/**
 * Firestore Schema: notifications/{notificationId}
 * 
 * {
 *   recipient: "user_uid",
 *   message: "Donation claimed",
 *   type: "info",                       // info | success | warning | error
 *   read: false,
 * 
 *   relatedId: "donationId",
 *   onModel: "Donation",
 * 
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

