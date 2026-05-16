import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Bell, X, Check } from "lucide-react";
import "./NotificationsDropdown.css";

const NotificationsDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        read: doc.data().readBy?.includes(user.uid)
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notifId) => {
    if (!user) return;
    const notifRef = doc(db, "notifications", notifId);
    await updateDoc(notifRef, {
      readBy: arrayUnion(user.uid)
    });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.read);
    const promises = unread.map(n => markAsRead(n.id));
    await Promise.all(promises);
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-dropdown glass fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="notif-header">
        <h3>Notificações</h3>
        <div className="notif-header-actions">
          {notifications.some(n => !n.read) && (
            <button className="mark-all-read" onClick={() => markAllAsRead()} title="Marcar todas como lidas">
              <Check size={18} />
            </button>
          )}
          <button onClick={onClose}><X size={18} /></button>
        </div>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">Tudo calmo por aqui...</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} onClick={() => markAsRead(n.id)}>
              <div className="notif-content">
                <p>{n.message}</p>
                <span>{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString('pt-BR') : 'Agora mesmo'}</span>
              </div>
              {!n.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
