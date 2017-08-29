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
  PARSING_COMMAND,
  WRITING_CARD,
  REPORTING_RESULT,
  SHOWING_ERROR
};

// Errors
enum NOTIFY_ERRORS : uint8_t {
  NOT_ENOUGH_MONEY,
  CARD_EXPIRED
};

// Commands coming from RPI
enum COMMAND : uint8_t {
  START,
  END,
  BLOCK_WRITE
};

// Command structure
typedef struct {
    short type;
    short blockNum;
    char blockData[16];
} Command;


namespace LibState {
  uint8_t current;
  
  void set(uint8_t _state) { current = _state; }
  bool check(uint8_t _state) { return current == _state; }
};



// Fixed size stack
// TODO: REWRITE
class CommandStack {
private:
  static const short commandsAmount = 20;
  short currentPush = 0;
  short currentPop = 0;

  Command stack[commandsAmount];
public:
  void push(short type, short blockNum=0, char blockData[16]=0) {
    if(currentPush == commandsAmount) {Serial.println("CMD STACK OVERFLOW"); return; }
    Command newCmd;
    newCmd.type = type;
    newCmd.blockNum = blockNum;
    strncpy(newCmd.blockData, blockData, 16);
    stack[currentPush] = newCmd;
    currentPush++;
  }
  Command* pop() {
    if(currentPop >= currentPush) {
      clear();
      return nullptr;
    } else {
      currentPop++;
      return &stack[currentPop-1];
    }
  }
  void clear() {
    currentPush = 0;
    currentPop = 0;
  }
};

//==============================================================================
namespace LibCom {
  uint32_t responseTimelimit = 5000;
  uint32_t dataSendTime = 0;
};
//==============================================================================
namespace LibSerial {
  bool cmdStartFound = false;
  bool cmdEndFound = false;

  const uint8_t cmdStart = '['; // 91
  const uint8_t cmdEnd = ']'; // 93

  CommandStack cmdStack;
  
  void executeCommand();
  void parseCommand ();
  void readSerialBuffer();
  void listenSerial();
  void reportWriting();
};
//==============================================================================
// TODO: make it static (fixed size)
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

  uint8_t getTimerIndex() {
    for(uint8_t i = 0; i < timersAmount; i++) {
      // if not exist then return free index
      if(timers[i].flags == 0) { return timers[i].index; }
    }
    // Error
    Serial.println(F("TIMER STACK OVERFLOW"));
    return -1;
  }

  uint8_t setTimer(uint16_t timeout, bool repeat=false, callbackfn_t fn=nullptr, uint8_t oldIndex=100) {
    uint8_t freeIndex;
    if(currentIndex >= timersAmount) {
      freeIndex = getTimerIndex();
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
namespace LibError {
  uint8_t current;

  void set(uint8_t _error) { current = _error; }
  bool check(uint8_t _error) { return current == _error; }
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
  uint8_t dataBlocks[dataBlocksAmount] = { 4, 5, 6, 8, 9, 10 };
  // Buffer where we store readed blocks
  uint8_t dataBlocksBuffer[dataBlocksAmount][dataBlocksLength] = {};

  // Is write to card is successful
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
    if(!isAuthSuccessful) { LibDebug::trace(F("---CANNOT AUTH---")); }
    if(!isReadSuccessful) { LibDebug::trace(F("---CANNOT READ---")); }

    // If all block was read then send to RPI
    // If not then log error
    if(isReadSuccessful) {
      LibDebug::trace(F("---READ OK---"));
      LibState::set(STATE::SENDING_DATA);
    } else {
      LibDebug::trace(F("---READ FAIL---"));
      LibState::set(STATE::WAITING_CARD);
    }
  }

  void sendData() {
    // Send transmission start sequence command
    LibDebug::trace(F("[S]"));

    for(uint8_t i = 0; i < dataBlocksAmount; i++) {
      // Send data block start command
      Serial.print('[');

      // Send block number with leading zero
      if(dataBlocks[i] < 10) {
        Serial.print('0');
      }
      Serial.print(dataBlocks[i]);
      
      // Send block bytes
      for(uint8_t j = 0; j < 16; j++) {
        Serial.print((char)dataBlocksBuffer[i][j]);
      }

      // Send data block end command
      Serial.println(']');
    }

    // Send transmission end sequence command
    LibDebug::trace(F("[E]"));

    // Register time when we send commands
    LibCom::dataSendTime = millis();

    // Switch arduino to waiting response state
    LibState::set(STATE::WAITING_RESPONSE);
  }

  bool writeToCard(int block, char _data[16]) {
    if(!authBlock(block)) {
        return false;
    } else {
      uint8_t data[16];
      strncpy(data, _data, 16);
      ////uint8_t *data = reinterpret_cast<uint8_t *>(_data);
      ////memcpy(data, _data, 16);
      return true;
      //return nfc.mifareclassic_WriteDataBlock (block, data);
    }
  }

  void writeDataOnCard () {

    Command *cmd = LibSerial::cmdStack.pop();
    if(cmd->type != COMMAND::START) {
      LibSerial::cmdStack.clear();
      LibState::set(STATE::WAITING_RESPONSE);
      return;
    }

    uint32_t currentTime;
    uint32_t timeLimit = 1000;

    while((cmd = LibSerial::cmdStack.pop())->type != COMMAND::END) {
      /*
      //LibDebug::trace(F("CMDTYPE: "), cmd->type);
      LibDebug::trace(F("BLOCKNUM: "), cmd->blockNum);
      LibDebug::trace(F("BLOCKDATA: "), cmd->blockData);
      */
      if(cmd->type != COMMAND::BLOCK_WRITE) {
        LibSerial::cmdStack.clear();
        LibState::set(STATE::WAITING_RESPONSE);
        return;
      }

      currentTime = millis();
      while(millis() - currentTime < timeLimit) {
        if(LibNFC::writeToCard(cmd->blockNum, cmd->blockData)) {
           isWriteSuccessful = true;
           break;
        } else {
          isWriteSuccessful = false;  
        }
      }
    }

    LibSerial::cmdStack.clear();
    LibState::set(STATE::REPORTING_RESULT);
  }
};
//==============================================================================
namespace LibSerial {
  class CommandBuffer {
  private:
    char buffer[24] = {0};
    short bufferCursor = 0;
  public:
    bool commandBeginFound = false;

    void add(char character) {
      buffer[bufferCursor] = character;
      bufferCursor++;
      if(bufferCursor > 23) {Serial.println(F("SERIAL BUFFER OVERFLOW"));}
    }
    void clear() {
      bufferCursor = 0;
    }
    bool isCurrent(char character) {
      return character == buffer[bufferCursor-1];
    }
    char get(short index) {
      if(index > bufferCursor) {
        return '0';  
      } else {
        return buffer[index];
      }
    }
    short length() {
      return bufferCursor;
    }
    char* getBuffer() {
      return buffer;
    }
  } commandBuffer;

  void parseCommand () {
    if (commandBuffer.get(1) == 'S') {
      cmdStack.push(COMMAND::START);
      LibState::set(STATE::READING_RESPONSE);
    } else if(commandBuffer.get(1) == 'W') {
      // Block number fetch
      char blockNum[2];
      strncpy(blockNum, commandBuffer.getBuffer()+2, 2);

      // Block data fetch
      char blockData[16];
      strncpy(blockData, commandBuffer.getBuffer()+4, 16);

      cmdStack.push(COMMAND::BLOCK_WRITE, strtol(blockNum, nullptr, 10), blockData);

      char printBlockData[17];
      printBlockData[16] = '\0';
      strncpy(printBlockData, commandBuffer.getBuffer()+4, 16);

      char printBlockNum[3];
      printBlockNum[2] = '\0';
      strncpy(printBlockNum, commandBuffer.getBuffer()+2, 2);
      LibState::set(STATE::READING_RESPONSE);
    } else if(commandBuffer.get(1) == 'F') {
      LibError::set(NOTIFY_ERRORS::NOT_ENOUGH_MONEY);
      LibState::set(STATE::SHOWING_ERROR);
    } else if(commandBuffer.get(1) == 'E') {
      cmdStack.push(COMMAND::END);
      LibState::set(STATE::WRITING_CARD);
    }
    /*
    if(commandBuffer.length() > 0) {
      Serial.println();
      for(int i=0; i < commandBuffer.length(); i++) { Serial.print(commandBuffer.get(i)); }
      Serial.println();
    }
    */
    cmdStartFound = false;
    cmdEndFound = false;
    commandBuffer.clear();
  }

  void readSerialBuffer() {
    commandBuffer.add(Serial.read());
    if(commandBuffer.isCurrent(cmdStart)) {
      cmdStartFound = true;
    } else if(commandBuffer.isCurrent(cmdEnd)) {
      cmdEndFound = true;
      LibState::set(STATE::PARSING_COMMAND);
    } else if(!cmdStartFound) {
      commandBuffer.clear();
    }
  }

  void listenSerial() {
    /*if(LibState::check(STATE::WAITING_RESPONSE)) {
      if(millis() - LibCom::dataSendTime > LibCom::responseTimelimit) {
        LibState::set(STATE::WAITING_CARD);
      }
    }*/
    while(Serial.available() > 0) {
      readSerialBuffer();
    }
  }

  void reportWriting() {
    if(LibNFC::isWriteSuccessful) {
      LibNotify::notifySuccess();
      LibDebug::trace(F("[STATUS|OK]"));
    } else {
      LibNotify::notifyError();
      LibDebug::trace(F("[STATUS|FAIL]"));
    }
    LibState::set(STATE::WAITING_CARD);
  }
};
//==============================================================================


// TODO: Remove irrelevant msgs and add more informative
#define MSG_SERIAL_CONNECTED  F("[OK|SERIAL CONNECTED]")
#define MSG_NFC_CONNECTED     F("[OK|NFC CONNECTED]")
#define MSG_WAITING_CARD      F("[OK|WAITING CARD]")
#define MSG_BOARD_NOT_FOUND   F("[ERROR|BOARD NOT FOUND]")

// TODO: Notify init with lights
void setup() {
  // Setting init state
  LibState::set(STATE::INIT);

  // Serial init
  Serial.begin(115200);
  while (!Serial);
  LibDebug::trace(MSG_SERIAL_CONNECTED); // DEBUG: serial start

  // Setting NFC lib
  nfc.begin();
  if (!nfc.getFirmwareVersion()) { // Checking board
    LibDebug::trace(MSG_BOARD_NOT_FOUND); // DEBUG: board not found
    while (1); // Can't continue without board
  }
  nfc.SAMConfig(); // Configuring nfc reader

  LibDebug::trace(MSG_NFC_CONNECTED); // DEBUG: board found
  
  LibDebug::trace(MSG_WAITING_CARD); // DEBUG: listening serial port
  LibState::set(STATE::WAITING_CARD); // Setting waiting card state
  
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
  /*case STATE::WAITING_RESPONSE:
  case STATE::READING_RESPONSE: LibSerial::listenSerial(); break;
  case STATE::PARSING_COMMAND:  LibSerial::parseCommand(); break;
  case STATE::WRITING_CARD:     LibNFC::writeDataOnCard(); break;
  case STATE::SHOWING_ERROR:    LibNotify::notifyError(); break;
  case STATE::REPORTING_RESULT: LibSerial::reportWriting(); break;*/
  default: break;
  }
}
