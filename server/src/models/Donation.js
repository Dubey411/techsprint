/**
 * Firestore Schema: donations/{donationId}
 * 
 * {
 *   donor: "user_uid",                 // string (Firebase UID)
 * 
 *   title: "Food Pack",
 *   description: "Veg food",
 *   foodType: "veg",                   // veg | non-veg | cooked | bakery
 *   quantity: "5 kg",
 *   expiryDate: Timestamp,
 * 
 *   location: {
 *     lat: 19.076,
 *     lng: 72.877,
 *     address: "Mumbai"
 *   },
 * 
 *   dropLocation: {
 *     lat: 19.08,
 *     lng: 72.88,
 *     address: "NGO Address"
 *   },
 * 
 *   foodLocations: [
 *     { lat: 19.07, lng: 72.87 },
 *     { lat: 19.08, lng: 72.88 }
 *   ],
 * 
 *   status: "available",               // available | claimed | picked_up | completed | expired
 *   claimedBy: "ngo_uid",
 *   assignedVolunteer: "volunteer_uid",
 * 
 *   permissions: "private",             // private | ngo_only | all_volunteers
 * 
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

