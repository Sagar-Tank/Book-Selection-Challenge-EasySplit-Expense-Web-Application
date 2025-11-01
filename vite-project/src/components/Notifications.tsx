import { useState } from 'react';
import React from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuList,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreateIcon from '@mui/icons-material/Create';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationType } from '../types';

const Notifications = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const open = Boolean(anchorEl);

  const getNotificationContent = (notification: { notificationType: NotificationType; createdByName: string; expenseDescription: string; amount: number; payeeName?: string; totalAmount?: number }) => {
    switch (notification.notificationType) {
      case 'paid_and_owe':
        return {
          primary: 'You paid and owe',
          secondary: (
            <Box>
              <Typography variant="caption" color="text.secondary">
                You paid ₹{notification.totalAmount?.toFixed(2) || '0.00'} for "{notification.expenseDescription}"
              </Typography>
              <Typography variant="caption" display="block" color="warning.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                You owe ₹{notification.amount.toFixed(2)} from your share
              </Typography>
            </Box>
          ),
          icon: <AccountBalanceWalletIcon />
        };
      case 'created':
        return {
          primary: 'Expense you created',
          secondary: (
            <Box>
              <Typography variant="caption" color="text.secondary">
                You created "{notification.expenseDescription}" and owe ₹{notification.amount.toFixed(2)}
              </Typography>
              {notification.payeeName && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Paid by: {notification.payeeName}
                </Typography>
              )}
            </Box>
          ),
          icon: <CreateIcon />
        };
      case 'owe':
      default:
        return {
          primary: 'You owe',
          secondary: (
            <Box>
              <Typography variant="caption" color="text.secondary">
                {notification.createdByName} added you to "{notification.expenseDescription}"
              </Typography>
              <Typography variant="caption" display="block" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                You owe ₹{notification.amount.toFixed(2)}
              </Typography>
              {notification.payeeName && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Paid by: {notification.payeeName}
                </Typography>
              )}
            </Box>
          ),
          icon: <PaymentIcon />
        };
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    handleClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="notifications-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationImportantIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <MenuList sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => {
              const content = getNotificationContent(notification);
              return (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderLeft: notification.read ? 'none' : '3px solid',
                    borderColor: 'primary.main',
                    py: 1.5,
                    px: 2
                  }}
                >
                  <ListItemIcon>
                    {React.cloneElement(content.icon, {
                      color: notification.read ? 'disabled' : 'primary'
                    })}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {content.primary}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {content.secondary}
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {!notification.read && (
                    <CheckCircleIcon
                      sx={{
                        ml: 1,
                        fontSize: 16,
                        color: 'primary.main'
                      }}
                    />
                  )}
                </MenuItem>
              );
            })}
          </MenuList>
        )}
      </Menu>
    </>
  );
};

export default Notifications;

