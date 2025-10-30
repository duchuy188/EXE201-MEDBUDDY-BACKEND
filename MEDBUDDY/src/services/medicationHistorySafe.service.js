const MedicationHistory = require('../models/MedicationHistory');

/**
 * Safely create a MedicationHistory document.
 * - Ensures userId is present
 * - Catches and logs validation/DB errors and returns null instead of throwing
 */
async function createSafeMedicationHistory(doc) {
  try {
    if (!doc || (!doc.userId && !doc.userId === 0)) {
      console.warn('createSafeMedicationHistory: missing userId, skipping creation. doc=', JSON.stringify({
        medicationId: doc && doc.medicationId,
        reminderId: doc && doc.reminderId,
        date: doc && doc.date,
        time: doc && doc.time
      }));
      return null;
    }

    // If userId is populated object (from populate), extract _id
    if (typeof doc.userId === 'object' && doc.userId !== null && doc.userId._id) {
      doc.userId = doc.userId._id;
    }

    const created = await MedicationHistory.create(doc);
    return created;
  } catch (err) {
    console.error('createSafeMedicationHistory: failed to create MedicationHistory', err && (err.stack || err.message || err));
    return null;
  }
}

module.exports = { createSafeMedicationHistory };
