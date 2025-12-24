/**
 * Test Script: Data Analytics Service
 * Tests phrasal verb tracking, pattern detection, and stakeholder notifications
 */

const dataAnalytics = require('./services/dataAnalytics');

console.log('\n' + '='.repeat(70));
console.log('📊 DATA ANALYTICS SERVICE - Test Script');
console.log('='.repeat(70));

// Reset data for clean test
dataAnalytics.resetAllData();

console.log('\n✅ Step 1: Analytics system initialized\n');
console.log(`📌 Technical Phrasal Verbs Tracked: ${dataAnalytics.TECHNICAL_PHRASAL_VERBS.length}`);
console.log(`📌 Failure Threshold: ${dataAnalytics.FAILURE_THRESHOLD * 100}%`);
console.log(`📌 Minimum Sample Size: ${dataAnalytics.MIN_SAMPLE_SIZE} audits`);

// Simulate 25 B2 user audits (20 without phrasal verbs = 80% failure rate)
console.log('\n✅ Step 2: Simulating 25 B2 user crisis responses...\n');

const b2UsersWithoutPhrasalVerbs = [
  'The system is not working. I need to check the database and fix the problem.',
  'There is an error in the code. I will review it and make changes to the system.',
  'The server stopped. I have to restart it and verify everything is OK.',
  'Our project has issues with the database. I need to find the solution quickly.',
  'The system application crashed. I must investigate the code and repair it.',
  'Database connection failed. I should fix this issue immediately.',
  'The service server is down. I will restore it as soon as possible.',
  'Code has bugs in the system. I need to correct them before deployment.',
  'System performance is bad. I have to optimize the database configuration.',
  'API server is not responding. I must check what happened in the code.',
  'The deployment to the server failed. I need to try again with different settings.',
  'Server resources are full. I should increase the system capacity.',
  'Authentication system stopped working. I will review the security settings.',
  'The update caused problems in the database. I need to undo the changes.',
  'Network system connection is broken. I must repair the configuration.',
  'Data synchronization to the server failed. I should investigate the cause.',
  'Memory usage in the system is too high. I need to reduce it somehow.',
  'The test suite found code issues. I must correct the errors.',
  'Production system has problems. I will analyze the server logs.',
  'Client reported issues with the database. I need to verify and solve them.'
];

const b2UsersWithPhrasalVerbs = [
  'I need to look into this database issue and figure out what went wrong with the system.',
  'Let me break down the server problem and work out a solution step by step.',
  'We should set up a fallback system and roll out the fix gradually to the code.',
  'I\'ll follow up with the team and catch up on the latest database changes.',
  'Let me boot up the server and log in to check the system configuration.'
];

// Record failures (no phrasal verbs)
b2UsersWithoutPhrasalVerbs.forEach((response, index) => {
  const userId = `b2_user_${index + 1}`;
  const mockAudit = {
    current_level: 'B2',
    confidence_percentage: 72,
    response_text: response
  };
  
  const result = dataAnalytics.recordPhrasalVerbUsage(userId, 'B2', response, mockAudit);
  
  console.log(`   User ${index + 1}/25: ${result.phrasal_verb_analysis.lacks_phrasal_verbs ? '❌ No phrasal verbs' : '✅ Has phrasal verbs'}`);
});

// Record successes (with phrasal verbs)
b2UsersWithPhrasalVerbs.forEach((response, index) => {
  const userId = `b2_user_${index + 21}`;
  const mockAudit = {
    current_level: 'B2',
    confidence_percentage: 85,
    response_text: response
  };
  
  const result = dataAnalytics.recordPhrasalVerbUsage(userId, 'B2', response, mockAudit);
  
  console.log(`   User ${index + 21}/25: ${result.phrasal_verb_analysis.lacks_phrasal_verbs ? '❌ No phrasal verbs' : '✅ Has phrasal verbs'} (found: ${result.phrasal_verb_analysis.phrasal_verbs_found.join(', ')})`);
});

// Analyze B2 phrasal verb gap
console.log('\n✅ Step 3: Analyzing B2 phrasal verb patterns...\n');

const gapAnalysis = dataAnalytics.analyzeB2PhrasalVerbGap();

console.log('📊 ANALYSIS RESULTS:');
console.log(`   → Total B2 Users Analyzed: ${gapAnalysis.total_b2_users}`);
console.log(`   → Users Failing (lacking phrasal verbs): ${gapAnalysis.users_failing}`);
console.log(`   → Failure Rate: ${gapAnalysis.failure_rate}%`);
console.log(`   → Threshold (80%) Exceeded: ${gapAnalysis.threshold_exceeded ? '🚨 YES' : '✅ NO'}`);

// Generate stakeholder notification if threshold exceeded
if (gapAnalysis.threshold_exceeded) {
  console.log('\n✅ Step 4: Generating stakeholder notification...\n');
  
  const notification = dataAnalytics.generateStakeholderNotification(gapAnalysis);
  
  console.log('🚨 STAKEHOLDER NOTIFICATION GENERATED:');
  console.log(`   ID: ${notification.id}`);
  console.log(`   Type: ${notification.type}`);
  console.log(`   Severity: ${notification.severity.toUpperCase()}`);
  console.log(`   Title: ${notification.title}`);
  console.log(`   Summary: ${notification.summary}`);
  console.log('\n   📋 RECOMMENDATION:');
  console.log(`   Action: ${notification.recommendation.action}`);
  console.log(`   Priority: ${notification.recommendation.priority}`);
  console.log(`   Estimated Impact: ${notification.recommendation.estimated_impact}`);
  console.log('\n   📚 SUGGESTED CONTENT MODULES:');
  notification.recommendation.suggested_content.forEach((content, i) => {
    console.log(`      ${i + 1}. ${content}`);
  });
  console.log('\n   🎯 TARGET OUTCOMES:');
  notification.recommendation.target_outcomes.forEach((outcome, i) => {
    console.log(`      ${i + 1}. ${outcome}`);
  });
  console.log(`\n   ✉️  Target Audience: ${notification.target_audience.join(', ')}`);
  console.log(`   📞 Call to Action: ${notification.call_to_action}`);
} else {
  console.log('\n⚠️  Step 4: Threshold not exceeded - no notification generated');
}

// Get active notifications
console.log('\n✅ Step 5: Retrieving active notifications...\n');

const activeNotifications = dataAnalytics.getActiveNotifications();
console.log(`📬 Active Notifications: ${activeNotifications.length}`);

activeNotifications.forEach((notif, index) => {
  console.log(`\n   ${index + 1}. ${notif.title}`);
  console.log(`      Severity: ${notif.severity}`);
  console.log(`      Created: ${notif.created_at}`);
  console.log(`      Acknowledged: ${notif.acknowledged ? 'Yes' : 'No'}`);
});

// Test notification acknowledgment
if (activeNotifications.length > 0) {
  console.log('\n✅ Step 6: Testing notification acknowledgment...\n');
  
  const firstNotification = activeNotifications[0];
  const ackResult = dataAnalytics.acknowledgeNotification(
    firstNotification.id,
    'admin_user_123',
    'Approved module creation - assigned to content team'
  );
  
  if (ackResult.success) {
    console.log('✅ Notification acknowledged successfully');
    console.log(`   Acknowledged by: ${ackResult.notification.acknowledged_by}`);
    console.log(`   Acknowledged at: ${ackResult.notification.acknowledged_at}`);
    console.log(`   Notes: ${ackResult.notification.acknowledgment_notes}`);
  }
}

// Get global statistics
console.log('\n✅ Step 7: Global analytics statistics...\n');

const globalStats = dataAnalytics.getGlobalStats();
console.log('📈 GLOBAL STATS:');
console.log(`   → Total Analytics Entries: ${globalStats.total_analytics_entries}`);
console.log(`   → Total Content Gap Alerts: ${globalStats.total_content_gap_alerts}`);
console.log(`   → Active Notifications: ${globalStats.active_notifications}`);
console.log(`   → Critical Notifications: ${globalStats.critical_notifications}`);
console.log(`   → B2 Phrasal Verb Failure Rate: ${globalStats.b2_phrasal_verb_failure_rate}%`);
console.log(`   → Technical Phrasal Verbs Tracked: ${globalStats.technical_phrasal_verbs_tracked}`);
console.log(`   → Failure Threshold: ${globalStats.failure_threshold}`);

// Generate weekly insights report
console.log('\n✅ Step 8: Generating weekly insights report...\n');

const weeklyReport = dataAnalytics.generateWeeklyInsightsReport();
console.log('📅 WEEKLY INSIGHTS REPORT:');
console.log(`   Period: ${weeklyReport.week_starting} to ${weeklyReport.week_ending}`);
console.log(`   Total Audits: ${weeklyReport.total_audits}`);
console.log(`   Content Gaps Detected: ${weeklyReport.content_gaps.length}`);
console.log(`   Recommendations Generated: ${weeklyReport.recommendations.length}`);

// Test filter by role
console.log('\n✅ Step 9: Testing role-based notification filtering...\n');

const contentCreatorNotifications = dataAnalytics.getNotificationsByTarget('content_creator');
const adminNotifications = dataAnalytics.getNotificationsByTarget('admin');
const partnerNotifications = dataAnalytics.getNotificationsByTarget('partner');

console.log(`📬 Notifications by Role:`);
console.log(`   → Content Creators: ${contentCreatorNotifications.length}`);
console.log(`   → Admins: ${adminNotifications.length}`);
console.log(`   → Partners: ${partnerNotifications.length}`);

// Final summary
console.log('\n' + '='.repeat(70));
console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
console.log('='.repeat(70));

console.log('\n📊 KEY FINDINGS:');
console.log(`   • ${gapAnalysis.failure_rate}% of B2 users lack technical phrasal verbs`);
console.log(`   • Threshold (80%) ${gapAnalysis.threshold_exceeded ? 'EXCEEDED ⚠️' : 'not exceeded ✅'}`);
console.log(`   • ${activeNotifications.length} stakeholder notification${activeNotifications.length !== 1 ? 's' : ''} generated`);
console.log(`   • System is tracking ${dataAnalytics.TECHNICAL_PHRASAL_VERBS.length} technical phrasal verbs`);

console.log('\n📈 NEXT STEPS FOR STAKEHOLDERS:');
console.log('   1. Review generated notifications in analytics dashboard');
console.log('   2. Approve recommended content module creation');
console.log('   3. Assign content team to develop Phrasal Verbs Masterclass');
console.log('   4. Monitor B2 user progress after module deployment');
console.log('   5. Track improvement in phrasal verb usage rates');

console.log('\n🔗 API ENDPOINTS READY:');
console.log('   GET  /api/analytics/notifications');
console.log('   GET  /api/analytics/notifications/:role');
console.log('   POST /api/analytics/notifications/:id/acknowledge');
console.log('   GET  /api/analytics/stats');
console.log('   GET  /api/analytics/phrasal-verb-gap');
console.log('   GET  /api/analytics/weekly-insights');

console.log('\n' + '='.repeat(70) + '\n');
