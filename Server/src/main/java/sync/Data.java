/*
 * Абстрактный класс данных в сообщение синхронизации
 */
package sync;

/**
 *
 * @author ksinn
 */
public abstract class Data {
    static Data getInstance(Message.MessageTypes type) throws Exception{
        switch (type){
            case start_sync: return new DataStart();
            case accept_sync: return new DataAccept();
            case send_data: return new DataSended();
            case sync_status: return new DataStatus();
            default: throw new Exception("Unknown type");
        }
    }
}
