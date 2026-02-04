const webpush = require('web-push');

console.log('🔑 Generando VAPID Keys para Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(70));
console.log('VAPID KEYS GENERADAS EXITOSAMENTE');
console.log('='.repeat(70));
console.log('\n📋 Public Key:');
console.log(vapidKeys.publicKey);
console.log('\n🔐 Private Key:');
console.log(vapidKeys.privateKey);
console.log('\n' + '='.repeat(70));
console.log('AGREGA ESTAS VARIABLES A TU ARCHIVO .env:');
console.log('='.repeat(70));
console.log(`\nVAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:info@nomadwear.com\n`);
console.log('='.repeat(70));
console.log('⚠️  IMPORTANTE: Guarda estas keys de forma segura');
console.log('⚠️  NO las compartas públicamente ni las subas a GitHub');
console.log('='.repeat(70) + '\n');
