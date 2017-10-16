/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package sync;

import sync.Message.MessageTypes;
import static sync.SyncSession.State.*;

/**
 *
 * @author ksinn
 * Сессия для хранения информации о процесе синхронизации. 
 * Допустимо 5 состояния(исключая начальное и конечное (opened, closed)): 
 *  take_start_message - получено сообщение о начале синхронизации
 *  send_last_id - отправлен идентифкатор последней транзакции в БД
 *  take_data - получены данные для синхронизации
 *  send_sync_status - отправлен статус синхронизации
 *  send_error_transport - отправленно сообщение о неправельном идентификаторе транспорта
 * 
 * Допустимые последовательности:
 *  opened->take_start_message->send_error_transport->closed;
 *  opened->take_start_message->send_last_id->take_data<->send_sync_status->closed;
 */


public class SyncSession {
    
    enum State {opened, closed, take_start_message, send_last_id, take_data, send_sync_status, send_error_transport};
    
    private int transport_id;
    private State current_state;
    
    {
        current_state = opened;
    }
    
    public SyncSession(){}
    
    public SyncSession(State state){
        current_state = state;
    }
    
    public State getCurrentState(){ return this.current_state; }
    public void close(){ this.current_state = closed;}
    public void changeState(Message message) {
        MessageTypes type = message.getType();
        switch(type){
            case start_sync: {
                this.current_state = take_start_message;
                return;
            }
            case accept_sync: {
                this.current_state = send_last_id;
                return;
            }
            case send_data: {
                this.current_state = take_data;
                return;
            }
            case sync_status: {
                if(((DataStatus)message.getData()).getCode()==400)
                    this.current_state = send_error_transport;
                else 
                    this.current_state = send_sync_status;
                return;
            }
            default: this.current_state = closed;
        }
    }
}
