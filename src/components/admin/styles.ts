import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  viewAllText: {
    color: '#2563eb',
    fontSize: 14,
  },
   // Stats Card styles
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardTitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  statCardValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statCardChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  filterToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activeFilter: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
  },
  filterText: {
    color: '#6b7280',
    fontSize:14,
  },
  activeFilterText: {
    color: 'white',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  timeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
    borderRadius:20,
    backgroundColor: 'white',
  },
  activeTimeFilter: {
    backgroundColor: '#e5e7eb',
  },
  timeFilterText: {
    color: '#6b7280',
    fontSize:14,
  },
  // Booking Card styles
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingCardName: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 16,
  },
  bookingCardService: {
    color: '#6b7280',
    fontSize: 14,
  },
  bookingCardAmount: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bookingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  bookingCardDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingCardDateTime: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
  },
  bookingCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingCardStatusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // Status specific styles
  'status-pending': {
    backgroundColor: '#fef3c7',
  },
  'status-pendingText': {
    color: '#92400e',
  },
  'status-ongoing': {
    backgroundColor: '#dbeafe',
  },
  'status-ongoingText': {
    color: '#1e40af',
  },
  'status-completed': {
    backgroundColor: '#d1fae5',
  },
  'status-completedText': {
    color: '#065f46',
  },
  'status-cancelled': {
    backgroundColor: '#fee2e2',
  },
  'status-cancelledText': {
    color: '#991b1b',
  },

  // Professional Card styles
  professionalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  professionalCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalAvatarText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  professionalInfo: {
    marginLeft: 12,
    flex: 1,
  },
  professionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  professionalName: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 16,
  },
  onlineStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  online: {
    backgroundColor: '#d1fae5',
  },
  offline: {
    backgroundColor: '#e5e7eb',
  },
  onlineStatusText: {
    fontSize: 12,
  },
  'onlineStatusText-online': {
    color: '#065f46',
  },
  'onlineStatusText-offline': {
    color: '#4b5563',
  },
  professionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 12,
    marginLeft: 4,
  },
  jobsText: {
    color: '#6b7280',
    fontSize: 12,
  },

  // Quick Actions styles
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    color: '#1f2937',
    fontWeight: '500',
    marginTop: 8,
    fontSize: 14,
  },

  // Search Filter Bar styles
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },

});

export default styles;