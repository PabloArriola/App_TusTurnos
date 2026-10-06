import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Appointment, Business, ClientProfile, PaymentTransaction, Service } from '../types';

export const firestoreService = {
  // --- APPOINTMENTS ---
  subscribeAppointments(callback: (appointments: Appointment[]) => void) {
    if (!db || !isFirebaseConfigured) return () => {};
    try {
      const q = collection(db, 'appointments');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: Appointment[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as Appointment), id: docSnap.id });
          });
          callback(list);
        }
      }, (error) => {
        console.warn('Firestore subscribeAppointments error:', error);
      });
    } catch (e) {
      console.warn('Firestore not ready for appointments subscription:', e);
      return () => {};
    }
  },

  async saveAppointment(appointment: Appointment): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const ref = doc(db, 'appointments', appointment.id);
      await setDoc(ref, appointment, { merge: true });
    } catch (e) {
      console.error('Error saving appointment to Firestore:', e);
    }
  },

  async saveAppointmentsBatch(appointments: Appointment[]): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      await Promise.all(appointments.map(a => setDoc(doc(db, 'appointments', a.id), a, { merge: true })));
    } catch (e) {
      console.error('Error saving appointments batch to Firestore:', e);
    }
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const ref = doc(db, 'appointments', id);
      await updateDoc(ref, { status });
    } catch (e) {
      console.error('Error updating appointment status in Firestore:', e);
    }
  },

  // --- BUSINESS ---
  subscribeBusiness(businessId: string, callback: (business: Business) => void) {
    if (!db || !isFirebaseConfigured) return () => {};
    try {
      const ref = doc(db, 'businesses', businessId);
      return onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          callback({ ...(snap.data() as Business), id: snap.id });
        }
      }, (error) => {
        console.warn('Firestore subscribeBusiness error:', error);
      });
    } catch (e) {
      console.warn('Firestore not ready for business subscription:', e);
      return () => {};
    }
  },

  async saveBusiness(business: Business): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const ref = doc(db, 'businesses', business.id);
      await setDoc(ref, business, { merge: true });
    } catch (e) {
      console.error('Error saving business to Firestore:', e);
    }
  },

  // --- TRANSACTIONS ---
  subscribeTransactions(callback: (txns: PaymentTransaction[]) => void) {
    if (!db || !isFirebaseConfigured) return () => {};
    try {
      const q = collection(db, 'transactions');
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: PaymentTransaction[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as PaymentTransaction), id: docSnap.id });
          });
          callback(list);
        }
      }, (error) => {
        console.warn('Firestore subscribeTransactions error:', error);
      });
    } catch (e) {
      console.warn('Firestore not ready for transactions subscription:', e);
      return () => {};
    }
  },

  async saveTransaction(txn: PaymentTransaction): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const ref = doc(db, 'transactions', txn.id);
      await setDoc(ref, txn, { merge: true });
    } catch (e) {
      console.error('Error saving transaction to Firestore:', e);
    }
  },

  // --- CLIENT PROFILE ---
  subscribeClientProfile(clientId: string, callback: (profile: ClientProfile) => void) {
    if (!db || !isFirebaseConfigured) return () => {};
    try {
      const ref = doc(db, 'clients', clientId);
      return onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          callback({ ...(snap.data() as ClientProfile), id: snap.id });
        }
      }, (error) => {
        console.warn('Firestore subscribeClientProfile error:', error);
      });
    } catch (e) {
      console.warn('Firestore not ready for client subscription:', e);
      return () => {};
    }
  },

  async saveClientProfile(profile: ClientProfile): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const ref = doc(db, 'clients', profile.id);
      await setDoc(ref, profile, { merge: true });
    } catch (e) {
      console.error('Error saving client profile to Firestore:', e);
    }
  }
};
