const PIN_KEY =
  "iptv_parental_pin";

const ENABLED_KEY =
  "iptv_parental_enabled";

// ENABLE
export function enableParental(
  pin
) {

  localStorage.setItem(
    PIN_KEY,
    pin
  );

  localStorage.setItem(
    ENABLED_KEY,
    "true"
  );
}

// DISABLE
export function disableParental() {

  localStorage.removeItem(
    ENABLED_KEY
  );
}

// ENABLED
export function isParentalEnabled() {

  return (
    localStorage.getItem(
      ENABLED_KEY
    ) === "true"
  );
}

// VERIFY
export function verifyPin(
  pin
) {

  return (
    localStorage.getItem(
      PIN_KEY
    ) === pin
  );
}

// LOCK CATEGORY
export function isLockedCategory(
  categoryName = ""
) {

  const lower =
    categoryName.toLowerCase();

  const blocked = [

    "adult",

    "xxx",

    "+18",

    "porn"
  ];

  return blocked.some(word =>

    lower.includes(word)
  );
}