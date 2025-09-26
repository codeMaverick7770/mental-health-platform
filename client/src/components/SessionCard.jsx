import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const SessionCard = ({ item }) => {
  const getStatusColor = (status) => {
    if (status === "scheduled") return '#3B82F6';
    else return '#10B981';
  };

  const getStatusText = (status) => {
    if (status === "scheduled") return 'Scheduled';
    else return 'Active';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onPress = () => {
    if(item.status==="active"){
      navigation.navigate('Chat', { title: item._id, _id: item._id })
    }
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.85} 
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Session {item.sessionId?.slice(-8) || 'N/A'}
          </Text>
          <Text style={styles.userName} numberOfLines={1}>
            {item.userName || 'Anonymous User'}
          </Text>
          <Text style={styles.meta}>
            {formatDate(item.scheduledAt)}
          </Text>
          {item.duration && (
            <Text style={styles.meta}>
              Duration: {item.duration} min
            </Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default SessionCard

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1ea7',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 15,
    overflow: 'hidden',
    marginRight: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#bbb',
    marginBottom: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
  },
});