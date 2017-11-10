#include <SPI.h>
#include <PN532.h>
#include <PN532_SPI.h>

// Setup SPI
// SCK = 13, MI = 12, MO = 11, SS = 10
PN532_SPI pn532spi(SPI, 10);
PN532 nfc(pn532spi);

// Arduino states
enum STATE : uint8_t {
  INIT,
  WAITING_CARD,
  READING_CARD,
  SENDING_DATA,
  WAITING_RESPONSE,
  READING_RESPONSE,
  WRITING_CARD,
  REPORTING_RESULT
};

// Errors
enum NOTICE_TYPE : uint8_t {
  SUCCESS,
  CARD_INVALID,
  NOT_ENOUGH_MONEY,
  CARD_EXPIRED
};

// Block structure on card
typedef struct {
    uint8_t num;
    uint8_t data[16];
} CardBlock;

//==============================================================================
namespace LibState {
  uint8_t current;
  
  void set(uint8_t _state) { current = _state; }
  bool check(uint8_t _state) { return current == _state; }
};
//==============================================================================
namespace LibError {
  uint8_t current;

  void set(uint8_t _error) { current = _error; }
  bool check(uint8_t _error) { return current == _error; }
};
//==============================================================================
namespace LibCom {
  uint32_t responseTimelimit = 1000;
  uint32_t dataSendTime = 0;
};
//==============================================================================
namespace LibDebug {
  inline void PRINT_TRACE(String MSG) { Serial.println(MSG); }
  inline void beginTrace(String MSG) { PRINT_TRACE(MSG); }
  inline void trace(String MSG)  { PRINT_TRACE(MSG); }
  inline void endTrace(String MSG) { PRINT_TRACE(MSG); }
  inline void trace(String TAG, String MSG) { PRINT_TRACE(TAG + " " + MSG); }
  inline void trace(String TAG, int MSG) { PRINT_TRACE(TAG + " " + String(MSG)); }
  inline void trace(String TAG, long MSG) { PRINT_TRACE(TAG + " " + String(MSG)); }
  inline void trace(String TAG, uint8_t MSG) { PRINT_TRACE(TAG + " " + String(MSG)); }
};
//==============================================================================
// TODO: make it simple
namespace LibTime {
  using callbackfn_t = void(*)();
  static const uint8_t timersAmount = 10;

  const uint8_t emptyFlag =     0x0;
  const uint8_t isExistFlag =   0x1;
  const uint8_t isEnabledFlag = 0x2;
  const uint8_t isDoneFlag =    0x4;
  const uint8_t isRepeatFlag =  0x8;

  typedef struct {
    uint8_t index;
    uint8_t flags;
    uint16_t timeout;
    uint32_t lastTime;
    callbackfn_t fn;
  } Timer;

  Timer timers[timersAmount];

  uint8_t currentIndex = 0;
  uint32_t currentTime = 0;

  inline bool checkFlag(uint8_t timerFlag, uint8_t flag)  { return ((timerFlag & flag) != 0); }
  inline void setFlag  (uint8_t &timerFlag, uint8_t flag) { timerFlag = timerFlag | flag; }
  inline void unsetFlag(uint8_t &timerFlag, uint8_t flag) { timerFlag = timerFlag & ~flag; }

  void clear(uint8_t index) { unsetFlag(timers[index].flags, isExistFlag); }
  void enabled(uint8_t index) { setFlag(timers[index].flags, isEnabledFlag); }
  void disable(uint8_t index) { unsetFlag(timers[index].flags, isEnabledFlag); }

  short getTimerIndex() {
    for(uint8_t i = 0; i < timersAmount; i++) {
      // if not exist then return free index
      if(timers[i].flags == 0) { return timers[i].index; }
    }
    LibDebug::trace(F("[EXCEPTION|TIMER STACK OVERFLOW]"));
    return -1;
  }

  short setTimer(uint16_t timeout, bool repeat=false, callbackfn_t fn=nullptr, uint8_t oldIndex=100) {
    short freeIndex;
    if(currentIndex >= timersAmount) {
      freeIndex = getTimerIndex();
      if(freeIndex == -1) { return -1;}
    } else if(oldIndex != 100) {
      freeIndex = oldIndex;
    } else {
      freeIndex = currentIndex;
      currentIndex++;
    }
    timers[freeIndex] = {
      freeIndex,    //index
      //           isExist        isEnabled       isDone      isRepeat
      (emptyFlag | isExistFlag  | isEnabledFlag | emptyFlag | (repeat ? isRepeatFlag : emptyFlag)),
      timeout,      //timeout
      millis(),     //lastTime
      fn            //fn
    };
    return freeIndex;
  }

  inline uint8_t setTimeout (callbackfn_t fn, uint16_t timeout) { return setTimer(timeout, false, fn); }
  inline uint8_t setInterval(callbackfn_t fn, uint16_t timeout) { return setTimer(timeout, true, fn); }
  inline uint8_t setImmediate(callbackfn_t fn) { return setTimer(0, false, fn); }

  inline void tickTimer(uint8_t index) {
    Timer &timer = timers[index];
    if(timer.flags == emptyFlag) { return; }
    if(!checkFlag(timer.flags, isExistFlag)) { return; }
    if(!checkFlag(timer.flags, isEnabledFlag)) { return; }
    if(timer.lastTime > currentTime) { timer.lastTime = currentTime; }
    
    if(currentTime - timer.lastTime > timer.timeout) {
      if(checkFlag(timer.flags, isRepeatFlag)) {
        setFlag(timer.flags, isDoneFlag);
      } else {
        timer.flags = 0;;
      }
      
      if(timer.fn) { timer.fn(); }
      timer.lastTime = currentTime;
    }
  }

  bool isDone(uint8_t index) {  
    currentTime = millis();
    tickTimer(index);
    return checkFlag(timers[index].flags, isDoneFlag);
  }

  void tick() {
    currentTime = millis();
    for(uint8_t index = 0; index < timersAmount; index++) { tickTimer(index); }
  }
};
//==============================================================================
namespace LibNotify {
  void notifyOff() {
    digitalWrite(5, LOW);
    digitalWrite(6, LOW);
  }
  void notifyError () {
    pinMode(5, OUTPUT);
    digitalWrite(5, HIGH);
    LibTime::setTimeout(&LibNotify::notifyOff, 1000);
  }
  void notifySuccess() {
    pinMode(6, OUTPUT);
    digitalWrite(6, HIGH);
    LibTime::setTimeout(&LibNotify::notifyOff, 1000);
  }
};
//==============================================================================
namespace LibSerial {
  namespace Buffer {
    uint8_t buffer[40] = {0};
    uint8_t cursor = 0;

    void add(uint8_t character) {
      if(cursor > 39) {
        cursor = 0;
        LibDebug::trace(F("[EXCEPTION|SERIAL BUFFER OVERFLOW]"));
      }
      buffer[cursor++] = character;
    }
    void clear() {
      cursor = 0;
    }

    uint8_t get(uint8_t index) {
      if(index > cursor) {
        return '0';  
      } else {
        return buffer[index];
      }
    }

    uint8_t getCursor() {
      if(cursor == 0) {
        return 0;
      } else {
        return cursor - 1;
      }
    }

    uint8_t getCurrent() {
      return get(getCursor());
    }

    uint8_t length() { return cursor; }
    uint8_t* getBuffer() { return buffer; }
  };

  namespace Packet {
    uint8_t const maxBlocks = 10;
    uint8_t cursor = 0;
    uint8_t length = 0;
    CardBlock blocks[maxBlocks];

    void clear() { length = 0; cursor = 0; }
    void start() { clear(); }
    void end() { length = cursor; }
    
    void addMessage() {
      if(cursor >= maxBlocks) {
        LibDebug::trace(F("[EXCEPTION|MESSAGES STACK OVERFLOW]"));
        return;
      }
      
      CardBlock block;

      // Fetch Block number
      uint8_t blockNum[3];
      blockNum[2] = '\0';
      memcpy(blockNum, Buffer::getBuffer() + 2, 2);
      block.num = strtol(blockNum, nullptr, 10);

      // Fetch block data
      uint8_t blockData[16];
      uint8_t sym[3];
      sym[2] = '\0';
      for(uint8_t i = 0, j = 0; i < 16; i++, j += 2) {
        memcpy(sym, Buffer::getBuffer() + 4 + j, 2);
        blockData[i] = strtol(sym, nullptr, 16);
        block.data[i] = blockData[i];
      }
      
      blocks[cursor++] = block;
    }
  };

  bool messageStart = false;
  bool messageEnd = false;
  
  void clearBufferState() {
    messageStart = false;
    messageEnd = false;
    Buffer::clear();
  }

  void parseNotifyMsg () {
    // Fetch msg code
    uint8_t msgCodeStr[3];
    msgCodeStr[2] = '\0';
    memcpy(msgCodeStr, Buffer::getBuffer() + 2, 2);
    uint8_t msgCode = strtol(msgCodeStr, nullptr, 10);

    switch(msgCode){
    case NOTICE_TYPE::SUCCESS: LibNotify::notifySuccess(); break;
    case NOTICE_TYPE::CARD_INVALID:
    case NOTICE_TYPE::NOT_ENOUGH_MONEY:
    case NOTICE_TYPE::CARD_EXPIRED: LibNotify::notifyError(); break;
    }
    
    LibState::set(STATE::WAITING_CARD);
  }

  void readSerial() {
    Buffer::add(Serial.read());
    if(Buffer::getCurrent() == '[') { messageStart = true; }
    if(Buffer::getCurrent() == ']') { messageEnd = true; }
    if(Buffer::getCurrent() != '[' && !messageStart) { clearBufferState(); }

    if(messageStart && messageEnd) {
      LibState::set(STATE::READING_RESPONSE);
      switch(Buffer::get(1)) {
      case 'S':
        Packet::start();
        break;
      case 'W':
        Packet::addMessage();
        break;
      case 'E':
        Packet::end();
        LibState::set(STATE::WRITING_CARD);
        break;
      case 'M':
        parseNotifyMsg();
        break;
      default:
        break;
      }
      clearBufferState();
     }
  }

  void listenSerial() {
    // Response timeout
    if(LibState::check(STATE::WAITING_RESPONSE)) {
      if(millis() - LibCom::dataSendTime > LibCom::responseTimelimit) {
        LibState::set(STATE::WAITING_CARD);
        return;
      }
    }
    
    while(Serial.available() > 0) {
      readSerial();
    }
  }
};
//==============================================================================
namespace LibNFC {
  // Buffer to store current UID
  uint8_t uid[7] = { 0, 0, 0, 0, 0, 0, 0 };

  // UID length
  uint8_t uidLength;

  // Default key A
  uint8_t keyA[6] = { 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF };

  // Current authenticated block
  uint8_t currentBlock = 0;

  // Number of bytes in one block
  static const uint8_t dataBlocksLength = 16;
  // Number of block that we need
  static const uint8_t dataBlocksAmount = 6;

  // Block that we need
  uint8_t dataBlocks[dataBlocksAmount] = { 0, 4, 5, 6, 8, 9 };
  // Buffer where we store readed blocks
  uint8_t dataBlocksBuffer[dataBlocksAmount][dataBlocksLength] = {};

  // Is write on card is successful
  bool isWriteSuccessful = false;

  void listenNFC() {
    // Waiting for card with timeout
    if(nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
      // Accept only MifareClassic with id 4 byte length
      if(uidLength == 4) {
        LibState::set(STATE::READING_CARD);
      } else {
        LibState::set(STATE::WAITING_CARD);
      }
    }
  }

  bool authBlock(uint8_t blockNum) {
    // If block already authenticated
    if(blockNum == currentBlock) {
      //return true;
    }
    // Set current authenticated block
    currentBlock = blockNum;
    // Try to authenticate
    return nfc.mifareclassic_AuthenticateBlock(uid, uidLength, blockNum, 1, keyA);
  }

  void readCard() {

    LibDebug::trace(F("[INFO|CARD FOUND]"));
    
    bool isReadSuccessful = false;
    bool isAuthSuccessful = false;

    uint32_t currentTime = millis();
    uint32_t timeLimit = 1000;
    
    while(millis() - currentTime < timeLimit) {
      for(uint8_t i = 0; i < dataBlocksAmount; i++) {
        // If auth fails
        if(!authBlock(dataBlocks[i])) {
          isAuthSuccessful = false;
          isReadSuccessful = false;
          break;
        }
        // If read fails
        if(!nfc.mifareclassic_ReadDataBlock(dataBlocks[i], dataBlocksBuffer[i])) {
          isReadSuccessful = false;
          break;
        }
        // If all ok then
        isAuthSuccessful = true;
        isReadSuccessful = true;
      }
      // Exit from timeout loop if all block was read
      if(isReadSuccessful) { break; }
    }

    // Log errors
    // TODO: specify log format
    if(!isAuthSuccessful) { LibDebug::trace(F("[NOTICE|CANNOT AUTH CARD BLOCKS]")); }
    if(!isReadSuccessful) { LibDebug::trace(F("[NOTICE|CANNOT READ CARD BLOCKS]")); }

    // If all block was read then send to RPI
    // If not then log error
    if(isReadSuccessful) {
      LibState::set(STATE::SENDING_DATA);
    } else {
      LibState::set(STATE::WAITING_CARD);
    }
  }

  void sendData() {
    // Send packet start message
    Serial.println(F("[S]"));

    for(uint8_t i = 0; i < dataBlocksAmount; i++) {
      // Send data block start token
      Serial.print('[');

      // Send block number with leading zero
      if(dataBlocks[i] < 10) {
        Serial.print('0');
      }
      Serial.print(dataBlocks[i]);
      
      // Send block bytes
      for(uint8_t j = 0; j < 16; j++) {
        if (dataBlocksBuffer[i][j] < 0x10) {
            Serial.print('0');
        }
        Serial.print(dataBlocksBuffer[i][j], HEX);
      }

      // Send data block end token
      Serial.println(']');
    }

    // Send packet end message
    Serial.println(F("[E]"));

    // Register time when we send packets
    LibCom::dataSendTime = millis();

    // Switch arduino to waiting response state
    LibState::set(STATE::WAITING_RESPONSE);
  }

  bool writeToCard(uint8_t blockNum, uint8_t _data[16]) {
    // If auth fails
    if(!authBlock(blockNum)) {
        LibDebug::trace(F("[WARNING|CANNOT WRITE TO CARD]"));
        return false;
    } else {
      //return true;
      return nfc.mifareclassic_WriteDataBlock (blockNum, _data);
    }
  }

  void writeDataOnCard () {
    isWriteSuccessful = false;

    if(LibSerial::Packet::length == 0) {
      LibState::set(STATE::WAITING_RESPONSE);
      LibSerial::Packet::clear();
      return;
    }

    uint32_t currentTime;
    uint32_t timeLimit = 1000;

    for(uint8_t i = 0; i < LibSerial::Packet::length; i++) {
      /*
      Serial.println();
      for(short k=0; k<16; k++) {
        Serial.print(LibSerial::Packet::blocks[i].data[k]);
      }
      Serial.println();
      */
      //LibDebug::trace(F("BLOCKNUM: "), LibSerial::Packet::blocks[i].num);
      //LibDebug::trace(F("BLOCKDATA: "), LibSerial::Packet::blocks[i].data);
      
      
      currentTime = millis();
      while(millis() - currentTime < timeLimit) {
        isWriteSuccessful = LibNFC::writeToCard(LibSerial::Packet::blocks[i].num, LibSerial::Packet::blocks[i].data);
        if(isWriteSuccessful) {
          break;
        }
      }
    }
    LibSerial::Packet::clear();
    LibState::set(STATE::REPORTING_RESULT);
  }
};
//==============================================================================
namespace LibCom {
  void reportWriteStatus() {
    if(LibNFC::isWriteSuccessful) {
      LibNotify::notifySuccess();
      LibDebug::trace(F("[WRITE STATUS|OK]"));
    } else {
      LibNotify::notifyError();
      LibDebug::trace(F("[WRTIE STATUS|FAIL]"));
    }
    LibState::set(STATE::WAITING_CARD);
  }
}
//==============================================================================

// TODO: Notify init with lights
void setup() {
  // Setting init state
  LibState::set(STATE::INIT);

  // Serial init
  Serial.begin(115200);
  while (!Serial);

  // Setting NFC lib
  nfc.begin();
  // Checking board
  if (!nfc.getFirmwareVersion()) {
    LibDebug::trace(F("[ERROR|NFC NOT CONNECTED]"));

    // Can't continue without board
    while (1);
  }

  // Configuring nfc reader
  nfc.SAMConfig();

  // Setting waiting card state
  LibState::set(STATE::WAITING_CARD);

  LibDebug::trace(F("[INIT SUCCESSFUL]"));
  
  ////LibTime::setInterval(&LibNotify::notifySuccess, 2000);
  ////LibTime::setInterval(&LibNotify::notifyError, 2000);
  ////LibTime::setInterval([](){ LibDebug::trace("STATE: ", LibState::current); }, 1000);
}

void loop() {
  LibTime::tick();
  switch(LibState::current) {
  case STATE::WAITING_CARD:     LibNFC::listenNFC(); break;
  case STATE::READING_CARD:     LibNFC::readCard(); break;
  case STATE::SENDING_DATA:     LibNFC::sendData(); break;
  case STATE::WAITING_RESPONSE:
  case STATE::READING_RESPONSE: LibSerial::listenSerial(); break;
  case STATE::WRITING_CARD:     LibNFC::writeDataOnCard(); break;
  case STATE::REPORTING_RESULT: LibCom::reportWriteStatus(); break;
  default: break;
  }
}
