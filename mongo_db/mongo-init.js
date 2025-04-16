
const COUNTRIES = ["USA", "Canada", "Mexico", "UK", "Germany", "France", "Spain", "Australia", "Japan", "Brazil", "India", "China", "Nigeria", "Egypt", "South Africa", "Argentina"];
const FIRST_NAMES = [
    "Olivia", "Emma", "Ava", "Sophia", "Isabella", "Charlotte", "Amelia", "Mia", "Harper", "Evelyn",
    "Liam", "Noah", "Oliver", "Elijah", "William", "James", "Benjamin", "Lucas", "Henry", "Alexander",
    "Aisha", "Fatima", "Sofia", "Maria", "Chloe", "Zoe", "Grace", "Lily", "Hannah", "Nora",
    "Mohammed", "Ahmed", "Omar", "Ali", "Youssef", "Khaled", "Ethan", "Daniel", "Matthew", "David",
    "Priya", "Ananya", "Saanvi", "Anya", "Diya", "Ishaan", "Arjun", "Vivaan", "Reyansh", "Aarav",
    "Mei", "Yuki", "Sakura", "Ren", "Haruto", "Kenji", "Isabelle", "Javier", "Mateo", "Camila"
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Martin", "Jackson",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson",
    "Kim", "Chen", "Wang", "Li", "Zhang", "Liu", "Singh", "Kumar", "Patel", "Khan",
    "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann",
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
    "Dubois", "Bernard", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon"
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'];

const PAYMENT_STATUSES = ["pending", "successful", "failed"];
const BOOKING_STATUSES = ["ok", "cancelled"];
const SAMPLE_NOTES = [
    "I will arrive after 4PM", "Can I have room with mountain view?", "No smoking floor please",
    "Requesting early check-in if possible.", "Allergic to feathers, need synthetic bedding.",
    "Celebrating an anniversary!", "Bringing a small pet (confirming policy).",
    "Need accessible room features.", "Late check-out requested.", "Travelling with infant."
];

const NUM_USERS = 100;
const NUM_BOOKINGS = 100;

function randomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomEmail(baseName) {
    const cleanedName = baseName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    return `${cleanedName}${randomInt(1, 999)}@${randomElem(EMAIL_DOMAINS)}`;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 0) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}

function randomElem(arr) {
    if (!arr || arr.length === 0) {
        return undefined; // Handle empty arrays
    }
    return arr[Math.floor(Math.random() * arr.length)];
}

print('--=== Starting MongoDB Initialization ===--');

try {
    db.createCollection("users");
    db.createCollection("bookings");
} catch (e) {
    print(`Error managing collections: ${e}`);
}

const usersToInsert = [];

print(`Generating ${NUM_USERS} random user documents...`);
for (let i = 0; i < NUM_USERS; i++) {
    const firstName = randomElem(FIRST_NAMES);
    const lastName = randomElem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const dob = randomDate(new Date(1960, 0, 1), new Date(2005, 11, 31));
    const signup = randomDate(new Date(2020, 0, 1), new Date());
    const bookingsCount = randomInt(0, 50);

    usersToInsert.push({
        email: randomEmail(firstName),
        name: name,
        dob: dob,
        country: randomElem(COUNTRIES),
        stats: {
            bookingsCount,
            cancelledBookingsCount: randomInt(0, Math.floor(bookingsCount / 4)),
            totalAmountSpent: randomFloat(0, 15000),
            totalCreditsBought: randomFloat(0, 5000)
        },
        signupDate: signup
    });
}

print(`Inserting ${usersToInsert.length} users...`);
const insertedUserIds = [];
try {
    const userInsertResult = db.users.insertMany(usersToInsert, { ordered: false });
    if (userInsertResult && userInsertResult.insertedIds) {
        insertedUserIds = [...Object.values(userInsertResult.insertedIds)];
        print(`Successfully inserted ${insertedUserIds.length} users.`);
    } else {
        print(`${insertedUserIds.length} users insertion completed, but could not retrieve all users IDs.`);
    }
} catch (e) {
    print(`Error inserting users: ${e}`);
}

if (insertedUserIds.length === 0) {
    print('Skipping booking insertion because no user IDs were available.');
    throw new Error('No user IDs available for booking insertion.');
}

print(`Generating ${NUM_BOOKINGS} booking documents...`);
const bookingsToInsert = [];
for (let i = 0; i < NUM_BOOKINGS; i++) {
    const roomPrice = randomFloat(60, 950); //generate random room price between the given range
    const discount = randomFloat(0, Math.min(roomPrice * 0.2, 120)); //generate random discounts 20% of room price or 120, whichever is lower
    const totalCost = parseFloat((roomPrice - discount).toFixed(2));
    const createdAt = randomDate(new Date(new Date().setFullYear(new Date().getFullYear() - 2)), new Date());
    const bookingDate = new Date(createdAt.getTime() + randomInt(1, 210) * 24 * 60 * 60 * 1000); // Up to ~7 months ahead
    const paymentStatus = randomElem(PAYMENT_STATUSES);
    let status = randomElem(BOOKING_STATUSES);

    bookingsToInsert.push({
        bookingId: randomString(6),
        userId: randomElem(insertedUserIds),
        createdAt: createdAt,
        bookingDate: bookingDate,
        paymentStatus: paymentStatus,
        status: status,
        guests: randomInt(1, 5),
        additionalNote: randomElem(SAMPLE_NOTES),
        roomPrice: roomPrice,
        discount: discount,
        totalCost: totalCost,
        numberNights: randomInt(1, 10)
    });
}

print(`Inserting ${bookingsToInsert.length} booking documents...`);
try {
    const bookingInsertResult = db.bookings.insertMany(bookingsToInsert, { ordered: false });
    const insertedIdsCount = bookingInsertResult.insertedIds ? Object.keys(bookingInsertResult.insertedIds).length : 'unkonown number of';
    print(`Successfully inserted ${insertedIdsCount} bookings.`);
} catch (e) {
    print(`Error inserting bookings: ${e}`);
}

print('--=== MongoDB Initialization Complete ===--');