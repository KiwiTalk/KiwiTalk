export const Common = {
  OK: 'OK',
  CLOSE: 'Schließen',
} as const;

export const Auth = {
  LOGIN: 'Anmelden',
  LOGOUT: 'Abmelden',
  PASSWORD: 'Passwort',

  LOGIN_MESSAGE: 'Du wurdest angemeldet.',
  LOGOUT_MESSAGE: 'Du wurdest abgemeldet.',

  FORCE_LOGIN: 'Ein anderes Gerät ist bereits verbunden. \nMöchtest du die bereits bestehende Verbindung trennen?',

  REASON: 'Grund: ',

  WRITE_PASSCODE: 'Gib den Passcode ein.',

  DEVICE_REGISTRATION_FAILED: 'Das Gerät konnte nicht registriert werden.',
  LOGIN_FAILED: 'Anmeldung ist fehlgeschlagen.',
  AUTO_LOGIN_FAILED: 'Automatische Anmeldung ist fehlgeschlagen.',
  NO_TOKEN: 'Die zur automatischen Anmeldung erforderlichen Daten konnten nicht gefunden werden.',

  KAKAO_ACCOUNT: 'Kakao-Account (E-Mail oder Telefonnummer)',
  SAVE_ID: 'Kennung speichern',
  USE_AUTO_LOGIN: 'Automatische Anmeldung verwenden',

  Result: {
    SUCCESS: 'Erfolgreich',
    NEED_PASSCODE: 'Ein Passcode ist erforderlich',
    ANOTHER_DEVICE: 'Ein anderes Gerät ist bereits verbunden.',
    RESTRICT: 'Der Account ist eingeschränkt.',
    WRONG: 'Die Kennung oder das Passwort ist falsch.',
  },
} as const;

export const Error = {
  UNKNOWN: 'Unbekannter Fehler',
  SERVER_CHECKING: 'Der Server wird zurzeit gewartet.',
  OLD_CLIENT: 'Die Clientversion ist zu veraltet.',
  REQUIRE_AUTHORIZATION: 'Autorisierung ist erforderlich.',
  BLOCK_ACCOUNT: 'Der Account ist gesperrt.',
  INVALID_ACCESS_TOKEN: 'Der Zugangstoken ist ungültig.',
  INVALID_LOGIN_TOKEN: 'Der Anmeldungstoken ist ungültig.',
  BLOCK_USER_INTERACTION: 'Es wurde versucht, eine Nachricht an einen blockierten Freund zu senden.',
  INVALID_CHATROOM: 'Der Chatraum existiert nicht.',
  INVALID_PARAM: 'Parameter ist ungültig.',
  INVALID_METHOD: 'Methode ist ungültig.',
  LOGOUTED_REQUEST: 'Die Anfrage stammt von einem abgemeldeten Account.',
  TOO_MANY_REQUEST: 'Die maximale Anzahl von autorisierungsversuchen wurde überschritten.',
  INVALID_PASSCODE: 'Der Passcode ist falsch.',
  NOT_ENCODED: 'Die UUID ist nicht in Base64 kodiert.',
  MAXIMUM_DEVICE: 'Die maximale Anzahl von autorisierbaren Geräten wurde überschritten. Es können maximal 5 Geräte autorisiert werden.',
  ANOTHER_LOGON: 'Ein anderer Client ist bereits angemeldet.',
  UNAUTHORIZED_DEVICE: 'Das Gerät ist nicht autorisiert.',
  INVALID_USER: 'Der Benutzer ist ungültig.',
  INVALID_FIELD: 'Einige Feldwerte sind ungültig.',
  NOT_EXIST_ACCOUNT: 'Der Kakao-Account konnte nicht gefunden werden.',
  SERVER_ERROR: 'Internal Error',
} as const;

export const Chat = {
  SEND_FAILED: 'Die Nachricht konnte nicht gesendet werden.',

  REPLY: 'Antworten',
  DELETE: 'Nachricht löschen',
  COPY: 'Nachricht kopieren',
} as const;

export default {
  Common,
  Auth,
  Error,
  Chat,
};
