const timezones = [
  { id: 'pt', tz: 'America/Los_Angeles', std: 'PST', dst: 'PDT' },
  { id: 'ct', tz: 'America/Chicago', std: 'CST', dst: 'CDT' },
  { id: 'et', tz: 'America/New_York', std: 'EST', dst: 'EDT' },
  { id: 'ist', tz: 'Asia/Kolkata', std: 'IST', dst: 'IST' }
];

function isDST(date, timeZone) {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const janOffset = getOffset(jan, timeZone);
  const julOffset = getOffset(jul, timeZone);
  const currentOffset = getOffset(date, timeZone);
  const standardOffset = Math.max(janOffset, julOffset);
  return currentOffset < standardOffset;
}

function getOffset(date, timeZone) {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tz = new Date(date.toLocaleString('en-US', { timeZone }));
  return (utc - tz) / 60000;
}

function getLabel(zone, date) {
  return isDST(date, zone.tz) ? zone.dst : zone.std;
}

function formatTime(date, timeZone) {
  const time = date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const parts = time.match(/^([\d:]+)\s*(AM|PM)$/i);
  if (parts) {
    return `${parts[1]}<span class="period">${parts[2]}</span>`;
  }
  return time;
}

function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function findMatchingZone(userTz) {
  return timezones.find(z => z.tz === userTz);
}

function updateClocks() {
  const now = new Date();
  const userTz = getUserTimezone();
  const matchingZone = findMatchingZone(userTz);

  // Primary clock
  const primaryTime = document.getElementById('primary-time');

  if (matchingZone) {
    primaryTime.innerHTML = formatTime(now, matchingZone.tz);
  } else {
    primaryTime.innerHTML = formatTime(now, userTz);
  }

  // Secondary clocks
  const secondaryContainer = document.getElementById('secondary-clocks');
  const secondaryZones = timezones.filter(z => z.tz !== (matchingZone?.tz || ''));

  // Only rebuild DOM if needed
  if (secondaryContainer.children.length !== secondaryZones.length) {
    secondaryContainer.innerHTML = '';
    for (const zone of secondaryZones) {
      const clock = document.createElement('div');
      clock.className = 'clock';
      clock.innerHTML = `
        <div class="time" id="${zone.id}-time"></div>
        <div class="label" id="${zone.id}-label"></div>
      `;
      secondaryContainer.appendChild(clock);
    }
  }

  // Update secondary times
  for (const zone of secondaryZones) {
    document.getElementById(`${zone.id}-time`).innerHTML = formatTime(now, zone.tz);
    document.getElementById(`${zone.id}-label`).textContent = getLabel(zone, now);
  }
}

updateClocks();
setInterval(updateClocks, 1000);
