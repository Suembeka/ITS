/*
 * Класс сообщения синхронизации. 
 * Такими сообщениями обменивается сервер и транспорт для синхронизации данных о транзакциях
 */
package sync;



/**
 *
 * @author ksinn
 */

public class Message {
    
    enum MessageTypes {start_sync, accept_sync, send_data, sync_status};

    private final MessageTypes type;
    private Data data;
    private SyncSession session;
    
    public Message(MessageTypes type) throws Exception{
        this.type = type;
        data = Data.getInstance(type);
        session = new SyncSession();
    }
    
    public MessageTypes getType(){ return type; }
    public Data getData(){ return data; }
    public SyncSession getSession(){ return session; }
    public void setSession(SyncSession session){ 
        this.session = session==null?this.session:session; 
        this.session.changeState(this);
    }
}
