/**
 * Firestore Schema: volunteers/{uid}
 * 
 * {
 *   skills: ["driving", "lifting"],
 * 
 *   certifications: [
 *     {
 *       name: "First Aid",
 *       issuingAuthority: "Red Cross",
 *       issueDate: Timestamp,
 *       expiryDate: Timestamp,
 *       documentUrl: "url"
 *     }
 *   ],
 * 
 *   availability: {
 *     monday: true,
 *     tuesday: true,
 *     wednesday: false,
 *     thursday: true,
 *     friday: true,
 *     saturday: false,
 *     sunday: false,
 *     preferredTimeSlots: ["10:00-14:00"]
 *   },
 * 
 *   preferences: {
 *     maxDistance: 20,
 *     maxWeight: 20,
 *     preferredAreas: ["Andheri"],
 *     blackoutAreas: [],
 *     notificationRadius: 10
 *   },
 * 
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

