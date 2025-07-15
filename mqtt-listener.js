
// MQTT and Prisma setup
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connect } = require('mqtt');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();


// HiveMQ Cloud connection details
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtts://your-hivemq-cloud-url:8883'; // Use 'mqtts' for TLS
const MQTT_USERNAME = process.env.MQTT_USERNAME || 'your-hivemq-username';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || 'your-hivemq-password';

// Connect to HiveMQ Cloud broker
const client = connect(MQTT_BROKER_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  // For testing only: rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  // Subscribe to all machine hourly report topics
  client.subscribe('machines/+/report/hourly', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to machines/+/report/hourly');
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    // Extract machineId from topic
    // topic format: machines/{machineId}/report/hourly
    const match = topic.match(/^machines\/(.+)\/report\/hourly$/);
    if (!match) {
      console.warn('Received message on unexpected topic:', topic);
      return;
    }
    const machineId = match[1];

    // Parse message payload (should be JSON)
    const data = JSON.parse(message.toString());

    // Create HourlyMachineReport in DB
    const createReport = await prisma.hourlyMachineReport.create({
      data: {
        machineId,
        reportTimestamp: new Date(data.report_timestamp),
        totalRoDispensed: data.total_ro_dispensed,
        totalAlDispensed: data.total_al_dispensed,
        totalMiDispensed: data.total_mi_dispensed,
        totalQrRevenue: data.total_qr_revenue,
        totalCashRevenue: data.total_cash_revenue,
        numCashTransaction: data.num_cash_transaction,
        numQrTransaction: data.num_qr_transaction,
        totalSBtlCount: data.total_s_btl_count,
        totalMBtlCount: data.total_m_btl_count,
        totalLBtlCount: data.total_l_btl_count,
        totalXlBtlCount: data.total_xl_btl_count,
        // receivedAt will default to now()
      },
    });
    console.log(`Hourly report saved for machine ${machineId}`, createReport);
  } catch (err) {
    console.error('Failed to process MQTT message:', err);
  }
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  client.end();
  process.exit(0);
});
