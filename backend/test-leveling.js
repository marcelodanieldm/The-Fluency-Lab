/**
 * Test Script: Dynamic Leveling System
 * Simulates a B2 user completing 3 crisis scenarios and getting C1-level audits
 * Verifies level-up notification and Week 3 (Negotiation) unlock
 */

const levelingService = require('./services/levelingService');
const linguisticAuditor = require('./services/linguisticAuditor');

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 TESTING DYNAMIC LEVELING SYSTEM');
console.log('═══════════════════════════════════════════════════════════\n');

// Test user
const TEST_USER = 'test_user_b2';

// Step 1: Initialize user as B2
console.log('📌 STEP 1: Initialize User as B2');
console.log('─────────────────────────────────────────────────────────');
const initResult = levelingService.initializeUser(TEST_USER, 'B2');
console.log('✅ User initialized:');
console.log(`   User ID: ${initResult.userId}`);
console.log(`   Current Level: ${initResult.current_level}`);
console.log(`   Unlocked Weeks: ${initResult.unlocked_weeks.join(', ')}`);
console.log(`   Expected: B2 with weeks [1, 2, 3]\n`);

// Step 2: Simulate 3 Crisis Responses with C1-level performance
console.log('📌 STEP 2: Simulate 3 Crisis Responses (C1-level)');
console.log('─────────────────────────────────────────────────────────');

const c1Responses = [
  {
    number: 1,
    text: "We are currently triaging the production outage and have identified a critical bottleneck in the database connection pool. The root cause appears to be a memory leak in the worker process. Our team is implementing a rollback to version 2.3.1 as a mitigation strategy. ETA for full service restoration is 15 minutes. We'll conduct a comprehensive post-mortem by EOD to prevent recurrence."
  },
  {
    number: 2,
    text: "I take full responsibility for this incident. We've escalated to our senior engineers who are currently remediating the issue. The mitigation plan includes enabling cache layer and scaling horizontally to handle the load. We're monitoring all KPIs closely and expect resolution within 10 minutes. Rest assured, we're implementing preventive measures to ensure this doesn't happen again."
  },
  {
    number: 3,
    text: "Our team has diagnosed the root cause as a configuration error in the load balancer. We're executing a hotfix deployment right now with a failover strategy in place. The incident has been thoroughly documented for our post-mortem analysis. ETA: 8 minutes to full recovery. We're proactively orchestrating additional monitoring to detect similar issues before they impact production."
  }
];

c1Responses.forEach(response => {
  console.log(`\n🔹 Response ${response.number}:`);
  console.log(`   Text: "${response.text.substring(0, 80)}..."`);
  
  // Perform linguistic audit
  const audit = linguisticAuditor.auditResponse(response.text, 'Production Outage');
  
  console.log(`\n   📊 Linguistic Audit Results:`);
  console.log(`   ├─ Detected Level: ${audit.current_level}`);
  console.log(`   ├─ Confidence: ${audit.confidence_percentage}%`);
  console.log(`   ├─ Soft Skills: ${audit.soft_skill_score}/10`);
  console.log(`   ├─ Technical Verbs: ${audit.technical_verb_analysis.C1_verbs.join(', ') || 'None'} ${audit.technical_verb_analysis.C2_verbs.length > 0 ? '+ ' + audit.technical_verb_analysis.C2_verbs.join(', ') : ''}`);
  console.log(`   ├─ Hesitation Ratio: ${audit.hesitation_ratio.ratio}%`);
  console.log(`   └─ False Friends: ${audit.false_friends_detected.length > 0 ? audit.false_friends_detected.map(f => f.incorrect).join(', ') : 'None'}`);
  
  // Record in leveling system
  const levelingResult = levelingService.recordAudit(TEST_USER, audit);
  
  console.log(`\n   🎯 Leveling System:`);
  console.log(`   ├─ Audit Recorded: ${levelingResult.audit_recorded ? '✅' : '❌'}`);
  console.log(`   ├─ Total Audits: ${levelingResult.audit_count}/3`);
  console.log(`   ├─ Level-Up Triggered: ${levelingResult.level_up_triggered ? '🎉 YES!' : 'Not yet'}`);
  
  if (levelingResult.level_up_triggered) {
    const notification = levelingResult.notification;
    console.log(`\n   🎊 LEVEL UP NOTIFICATION:`);
    console.log(`   ╔═══════════════════════════════════════════════════════╗`);
    console.log(`   ║  ${notification.title.padEnd(52)} ║`);
    console.log(`   ╠═══════════════════════════════════════════════════════╣`);
    console.log(`   ║  From: ${notification.from_level}  →  To: ${notification.to_level}                              ║`);
    console.log(`   ║  ${notification.message.substring(0, 52).padEnd(52)} ║`);
    console.log(`   ╠═══════════════════════════════════════════════════════╣`);
    console.log(`   ║  Newly Unlocked:                                    ║`);
    console.log(`   ║  📚 Week ${notification.unlocked_content.newly_unlocked.join(', ')} - Negotiation Scenarios           ║`);
    console.log(`   ╚═══════════════════════════════════════════════════════╝`);
  }
});

// Step 3: Check final status
console.log('\n\n📌 STEP 3: Check Final User Status');
console.log('─────────────────────────────────────────────────────────');
const finalStatus = levelingService.getUserStatus(TEST_USER);
console.log(`\n📈 User Status:`);
console.log(`   ├─ User ID: ${finalStatus.userId}`);
console.log(`   ├─ Current Level: ${finalStatus.current_level}`);
console.log(`   ├─ Unlocked Weeks: [${finalStatus.unlocked_weeks.join(', ')}]`);
console.log(`   ├─ Total Audits: ${finalStatus.total_audits}`);
console.log(`   └─ Level-Up Available: ${finalStatus.has_level_up_available ? '🎉 YES' : 'No'}`);

console.log(`\n📊 Recent Audit Summary:`);
finalStatus.recent_audits.forEach((audit, i) => {
  console.log(`   ${i + 1}. ${audit.detected_level} (${audit.confidence}% confidence)`);
});

console.log(`\n🎯 Level-Up Progress:`);
console.log(`   ├─ Progress: ${finalStatus.level_up_progress.percentage}%`);
console.log(`   ├─ Status: ${finalStatus.level_up_progress.status}`);
console.log(`   └─ Message: ${finalStatus.level_up_progress.message}`);

// Step 4: Accept level-up
console.log('\n\n📌 STEP 4: Accept Level-Up');
console.log('─────────────────────────────────────────────────────────');

const notifications = levelingService.getUserNotifications(TEST_USER);
const levelUpNotification = notifications.find(n => n.type === 'LEVEL_UP' && !n.read);

if (levelUpNotification) {
  console.log(`\n🎁 Accepting notification: ${levelUpNotification.id}`);
  
  const acceptResult = levelingService.acceptLevelUp(TEST_USER, levelUpNotification.id);
  
  if (acceptResult.success) {
    console.log(`\n✅ LEVEL UP ACCEPTED!`);
    console.log(`   ├─ Old Level: ${acceptResult.old_level}`);
    console.log(`   ├─ New Level: ${acceptResult.new_level}`);
    console.log(`   ├─ All Unlocked Weeks: [${acceptResult.unlocked_weeks.join(', ')}]`);
    console.log(`   └─ Newly Unlocked: Week ${acceptResult.newly_unlocked_weeks.join(', ')}`);
    console.log(`\n   Message: ${acceptResult.message}`);
  } else {
    console.log(`\n❌ Failed to accept: ${acceptResult.error}`);
  }
} else {
  console.log(`\n❌ No level-up notification found!`);
}

// Step 5: Verify Week 3 access
console.log('\n\n📌 STEP 5: Verify Week 3 (Negotiation) Access');
console.log('─────────────────────────────────────────────────────────');

const week3Access = levelingService.hasAccessToWeek(TEST_USER, 3);
const week4Access = levelingService.hasAccessToWeek(TEST_USER, 4);

console.log(`\n🔐 Access Verification:`);
console.log(`   ├─ Week 1 (Casual): ${levelingService.hasAccessToWeek(TEST_USER, 1) ? '✅ Unlocked' : '🔒 Locked'}`);
console.log(`   ├─ Week 2 (Crisis): ${levelingService.hasAccessToWeek(TEST_USER, 2) ? '✅ Unlocked' : '🔒 Locked'}`);
console.log(`   ├─ Week 3 (Negotiation): ${week3Access ? '✅ Unlocked' : '🔒 Locked'}`);
console.log(`   └─ Week 4 (Executive): ${week4Access ? '✅ Unlocked' : '🔒 Locked'}`);

// Step 6: System stats
console.log('\n\n📌 STEP 6: System Statistics');
console.log('─────────────────────────────────────────────────────────');

const stats = levelingService.getSystemStats();
console.log(`\n📊 Global Stats:`);
console.log(`   ├─ Total Users: ${stats.total_users}`);
console.log(`   ├─ Total Audits: ${stats.total_audits}`);
console.log(`   ├─ Total Level-Ups: ${stats.total_level_ups}`);
console.log(`   ├─ Pending Level-Ups: ${stats.pending_level_ups}`);
console.log(`   └─ Level Distribution:`, stats.level_distribution);

// Final validation
console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('✅ TEST RESULTS');
console.log('═══════════════════════════════════════════════════════════');

const finalCheck = levelingService.getUserStatus(TEST_USER);
const testsPassed = [];
const testsFailed = [];

// Test 1: User upgraded to C1
if (finalCheck.current_level === 'C1') {
  testsPassed.push('✅ User successfully upgraded from B2 to C1');
} else {
  testsFailed.push(`❌ Expected C1, got ${finalCheck.current_level}`);
}

// Test 2: Week 3 unlocked
if (week3Access) {
  testsPassed.push('✅ Week 3 (Negotiation) successfully unlocked');
} else {
  testsFailed.push('❌ Week 3 (Negotiation) still locked');
}

// Test 3: 3 audits recorded
if (finalCheck.total_audits === 3) {
  testsPassed.push('✅ All 3 audits recorded');
} else {
  testsFailed.push(`❌ Expected 3 audits, got ${finalCheck.total_audits}`);
}

// Test 4: All audits detected C1
const allC1 = finalCheck.recent_audits.every(a => a.detected_level === 'C1');
if (allC1) {
  testsPassed.push('✅ All audits correctly detected C1 level');
} else {
  testsFailed.push('❌ Not all audits detected C1');
}

// Display results
console.log('\n📋 Test Summary:\n');
testsPassed.forEach(test => console.log(test));
testsFailed.forEach(test => console.log(test));

console.log(`\n${testsFailed.length === 0 ? '🎉 ALL TESTS PASSED!' : `⚠️  ${testsFailed.length} TEST(S) FAILED`}`);
console.log('═══════════════════════════════════════════════════════════\n');

// Cleanup
console.log('🧹 Cleaning up test data...');
levelingService.clearUserData(TEST_USER);
console.log('✅ Test complete!\n');
