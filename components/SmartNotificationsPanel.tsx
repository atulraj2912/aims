'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  sku: string | null;
  status: string;
  action_data: any;
  created_at: string;
}

export default function SmartNotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data.filter((n: Notification) => n.status === 'pending'));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleApprove = async (notification: Notification) => {
    setProcessingId(notification.id);
    setLoading(true);

    try {
      if (notification.type === 'reorder') {
        await fetch('/api/auto-reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: notification.id,
            action: 'approve',
            orderQuantity: notification.action_data?.recommended_quantity
          })
        });
      } else if (notification.type === 'expiring' || notification.type === 'discount') {
        await fetch('/api/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: notification.id,
            action: 'approve',
            discountPercentage: notification.action_data?.suggested_discount
          })
        });
      } else if (notification.type === 'defect') {
        await fetch('/api/defects', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            defectId: notification.action_data?.defect_id,
            action: 'approve_return'
          })
        });
      }

      // Remove from list
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Approval error:', error);
      alert('Failed to process approval');
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const handleReject = async (notification: Notification) => {
    setProcessingId(notification.id);
    setLoading(true);

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notification.id,
          status: 'rejected'
        })
      });

      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return '⚠️';
      case 'reorder': return '🤖';
      case 'expiring': return '⏰';
      case 'discount': return '💰';
      case 'defect': return '❌';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'from-orange-500 to-red-500';
      case 'reorder': return 'from-purple-500 to-indigo-500';
      case 'expiring': return 'from-yellow-500 to-orange-500';
      case 'discount': return 'from-green-500 to-emerald-500';
      case 'defect': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🔔 Smart Notifications
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                {notifications.length} pending action{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <span className="text-white text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(notif.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {notif.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        {notif.message}
                      </p>

                      {/* Action Data */}
                      {notif.action_data && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            {notif.action_data.current_stock !== undefined && (
                              <div>
                                <span className="text-gray-600">Current Stock:</span>{' '}
                                <span className="font-semibold text-gray-900">
                                  {notif.action_data.current_stock} units
                                </span>
                              </div>
                            )}
                            {notif.action_data.recommended_quantity && (
                              <div>
                                <span className="text-gray-600">Recommended:</span>{' '}
                                <span className="font-semibold text-purple-600">
                                  {notif.action_data.recommended_quantity} units
                                </span>
                              </div>
                            )}
                            {notif.action_data.days_until_expiry !== undefined && (
                              <div>
                                <span className="text-gray-600">Days Until Expiry:</span>{' '}
                                <span className="font-semibold text-orange-600">
                                  {notif.action_data.days_until_expiry} days
                                </span>
                              </div>
                            )}
                            {notif.action_data.suggested_discount && (
                              <div>
                                <span className="text-gray-600">Suggested Discount:</span>{' '}
                                <span className="font-semibold text-green-600">
                                  {notif.action_data.suggested_discount}% OFF
                                </span>
                              </div>
                            )}
                            {notif.action_data.days_until_stockout !== undefined && (
                              <div>
                                <span className="text-gray-600">Days to Stockout:</span>{' '}
                                <span className="font-semibold text-red-600">
                                  {notif.action_data.days_until_stockout} days
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(notif)}
                          disabled={loading && processingId === notif.id}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {loading && processingId === notif.id ? '⏳ Processing...' : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(notif)}
                          disabled={loading && processingId === notif.id}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg whitespace-nowrap flex items-center gap-2"
      >
        <span>🔔</span> Notifications
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {typeof window !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
