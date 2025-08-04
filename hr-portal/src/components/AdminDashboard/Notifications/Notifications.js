import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Box,
} from "@mui/material";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';

const initialNotifications = [
  { id: 1, message: "New user registered", read: false },
  { id: 2, message: "System update available", read: false },
  { id: 3, message: "Backup completed successfully", read: true },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          System Notifications
        </Typography>
        <List>
          {notifications.map((note) => (
            <ListItem
              key={note.id}
              secondaryAction={
                <IconButton onClick={() => toggleRead(note.id)}>
                  {note.read ? (
                    <MarkEmailUnreadIcon color="primary" />
                  ) : (
                    <MarkEmailReadIcon color="action" />
                  )}
                </IconButton>
              }
            >
              <ListItemText
                primary={note.message}
                secondary={note.read ? "Read" : "Unread"}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Notifications;
