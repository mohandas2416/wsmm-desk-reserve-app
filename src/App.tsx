import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonButton,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonDatetime,
  IonDatetimeButton,
} from '@ionic/react';
import React, { useState } from 'react';
import './App.css';

interface Desk {
  id: number;
  name: string;
  location: string;
  slots: { date: string; times: string[] }[];
}

const MAP_IMAGES = [
  'https://via.placeholder.com/300x200?text=Desk+Map+1',
  'https://via.placeholder.com/300x200?text=Desk+Map+2',
  'https://via.placeholder.com/300x200?text=Desk+Map+3',
];

const App: React.FC = () => {
  const today = new Date();
  const formattedToday = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${today.getFullYear()}`;

  const [currentTab, setCurrentTab] = useState<'available' | 'reserved'>('available');
  const [selectedDate, setSelectedDate] = useState(formattedToday);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<{ name: string; location: string } | null>(null);
  const [mapImage, setMapImage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmReserve, setShowConfirmReserve] = useState(false);
  const [showConfirmUnreserve, setShowConfirmUnreserve] = useState(false);
  const [deskToUnreserveIndex, setDeskToUnreserveIndex] = useState<number | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const [availableDesks] = useState<Desk[]>([
    {
      id: 1,
      name: 'Desk A1',
      location: 'Floor 1',
      slots: [
        { date: '06-17-2025', times: ['09:00 AM - 11:00 AM', '02:00 PM - 04:00 PM'] },
        { date: '06-18-2025', times: ['10:00 AM - 12:00 PM'] },
      ],
    },
    {
      id: 2,
      name: 'Desk A2',
      location: 'Floor 2',
      slots: [
        { date: '06-17-2025', times: ['11:00 AM - 01:00 PM'] },
        { date: '06-19-2025', times: ['02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'] },
      ],
    },
    {
      id: 3,
      name: 'Desk B1',
      location: 'Floor 3',
      slots: [
        { date: '06-18-2025', times: ['08:00 AM - 10:00 AM'] },
        { date: '06-20-2025', times: ['09:00 AM - 11:00 AM'] },
      ],
    },
    {
      id: 4,
      name: 'Desk C3',
      location: 'Floor 4',
      slots: [
        { date: '06-19-2025', times: ['01:00 PM - 03:00 PM'] },
        { date: '06-20-2025', times: ['11:00 AM - 01:00 PM'] },
      ],
    },
  ]);

  const [reservedDesks, setReservedDesks] = useState<
    { id: number; name: string; location: string; date: string; time: string }[]
  >([]);

  const reserveDesk = () => {
    const desk = availableDesks.find((d) => d.id === selectedDeskId);
    if (!desk || !selectedTime) return;

    setReservedDesks([
      ...reservedDesks,
      { id: desk.id, name: desk.name, location: desk.location, date: selectedDate, time: selectedTime },
    ]);

    setSelectedDeskId(null);
    setSelectedTime('');
    setCurrentTab('reserved');
  };

  const unreserveDesk = () => {
    if (deskToUnreserveIndex !== null) {
      const updated = [...reservedDesks];
      updated.splice(deskToUnreserveIndex, 1);
      setReservedDesks(updated);
      setDeskToUnreserveIndex(null);
    }
  };

  const filteredDesks = availableDesks.filter((desk) =>
    desk.slots.some((slot) => slot.date === selectedDate)
  );

  const getAvailableTimes = (deskId: number): string[] => {
    const desk = availableDesks.find((d) => d.id === deskId);
    const slot = desk?.slots.find((s) => s.date === selectedDate);
    return slot?.times ?? [];
  };

  const openMapModal = (desk: { name: string; location: string }) => {
    setSelectedDesk(desk);
    setMapImage('');
    setShowModal(true);
  };

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Desk Reservation</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonSegment value={currentTab} onIonChange={(e) => setCurrentTab(e.detail.value as any)}>
            <IonSegmentButton value="available">
              <IonLabel>Available</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reserved">
              <IonLabel>Reserved</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {currentTab === 'available' && (
            <>
              <IonItem>
                <IonLabel>Date</IonLabel>
                <IonDatetimeButton datetime="date-select" onClick={() => setShowDateModal(true)} />
              </IonItem>

              <IonModal keepContentsMounted={true} isOpen={showDateModal}>
                <IonDatetime
                  id="date-select"
                  presentation="date"
                  onIonChange={(e) => {
                    const value = e.detail.value;
                    const dateStr = Array.isArray(value) ? value[0] ?? '' : value ?? '';
                    const rawDate = new Date(dateStr);
                    const iso = isNaN(rawDate.getTime())
                      ? formattedToday
                      : `${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}-${rawDate.getFullYear()}`;
                    setSelectedDate(iso);
                    setSelectedDeskId(null);
                    setSelectedTime('');
                    setShowDateModal(false);
                  }}
                />
              </IonModal>

              <IonList>
                {filteredDesks.map((desk) => (
                  <IonItem
                    key={desk.id}
                    button
                    onClick={() => {
                      setSelectedDeskId(desk.id);
                      setSelectedTime('');
                    }}
                    className={selectedDeskId === desk.id ? 'selected-desk' : ''}
                  >
                    <IonLabel>
                      <h2>{desk.name}</h2>
                      <p>{desk.location}</p>
                      <small>Time Slots: {getAvailableTimes(desk.id).join(', ')}</small>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>

              {selectedDeskId && (
                <IonItem>
                  <IonLabel>Time Slot</IonLabel>
                  <IonSelect
                    placeholder="Select Time"
                    value={selectedTime}
                    onIonChange={(e) => setSelectedTime(e.detail.value)}
                  >
                    {getAvailableTimes(selectedDeskId).map((time, index) => (
                      <IonSelectOption key={index} value={time}>
                        {time}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              )}

              <IonButton
                expand="full"
                color="primary"
                disabled={!selectedDeskId || !selectedTime}
                onClick={() => setShowConfirmReserve(true)}
              >
                Reserve
              </IonButton>
            </>
          )}

          {currentTab === 'reserved' && (
            <IonList>
              {reservedDesks.map((desk, index) => (
                <IonItem key={index} button>
                  <IonLabel onClick={() => openMapModal({ name: desk.name, location: desk.location })}>
                    <h2>{desk.name}</h2>
                    <p>{desk.time}</p>
                    <small>{desk.date} — {desk.location}</small>
                  </IonLabel>
                  <IonButton
                    slot="end"
                    color="danger"
                    onClick={() => {
                      setDeskToUnreserveIndex(index);
                      setShowConfirmUnreserve(true);
                    }}
                  >
                    Release
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          )}

          <IonAlert
            isOpen={showConfirmReserve}
            onDidDismiss={() => setShowConfirmReserve(false)}
            header="Confirm Reservation"
            message={`Reserve desk for ${selectedTime} on ${selectedDate}?`}
            buttons={[
              { text: 'Cancel', role: 'cancel' },
              { text: 'Yes', handler: reserveDesk },
            ]}
          />

          <IonAlert
            isOpen={showConfirmUnreserve}
            onDidDismiss={() => setShowConfirmUnreserve(false)}
            header="Cancel Reservation"
            message="Are you sure you want to unreserve this desk?"
            buttons={[
              { text: 'No', role: 'cancel' },
              { text: 'Yes', handler: unreserveDesk },
            ]}
          />

          <IonModal isOpen={showModal} onDidDismiss={() => {
            setShowModal(false);
            setMapImage('');
          }}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Desk Info</IonTitle>
                <IonButton slot="end" onClick={() => setShowModal(false)}>Close</IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <h2>{selectedDesk?.name}</h2>
              <p>{selectedDesk?.location}</p>
              {!mapImage && (
                <IonButton fill="clear" onClick={() => {
                  const randomMap = MAP_IMAGES[Math.floor(Math.random() * MAP_IMAGES.length)];
                  setMapImage(randomMap);
                }}>
                  Click to view map
                </IonButton>
              )}
              {mapImage && (
                <img
                  src={mapImage}
                  alt="Desk Map"
                  style={{ width: '100%', marginTop: '1rem' }}
                />
              )}
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
