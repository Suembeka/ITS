package sync;

import entity.Route;
import entity.Station;
import entity.Transaction;
import entity.Transport;
import hibernate.Factory;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.UUID;
import junit.framework.TestCase;
import static sync.Message.MessageTypes.accept_sync;
import static sync.Message.MessageTypes.sync_status;
import static sync.SyncSession.State.send_last_id;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author ksinn
 */
public class TestSync extends TestCase {

    SyncService serv = new SyncService();

    @Override
    protected void setUp() throws Exception {
        serv.setAnswerer(new AnswererStart());
        serv.setAnswerer(new AnswererSync());
    }

    public void testToStartSync() throws Exception {

        //Normal sync
        Message mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(1);
        Message answer = serv.answer(mes);

        if (!answer.getType().equals(accept_sync)) {
            throw new Exception("error type normal. type is "+answer.getType());
        }
        if (((DataAccept) answer.getData()).getLastTransactionId() != Factory.getInstance().getTransactionDAO().getLastForTransportId(1).getId().getId()) {
            throw new Exception("error last id");
        }

        //Uncnown transport id
        mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(9999);
        answer = serv.answer(mes);

        if (!answer.getType().equals(sync_status)) {
            throw new Exception("error type in unknown id. type is "+answer.getType());
        }
        if (((DataStatus) answer.getData()).getCode() != 400) {
            throw new Exception("error code/ not 400");
        }
        if (!((DataStatus) answer.getData()).getErrorMessage().equals("Unknown transport id!")) {
            throw new Exception("error message/not Unknown transport id!");
        }
        
        //uncorect session 
        mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(1);
        mes.setSession(new SyncSession(send_last_id));
        
        answer = serv.answer(mes);

        if (((DataStatus) answer.getData()).getCode() != 400) {
            throw new Exception("error code/not 400");
        }
        if (!((DataStatus) answer.getData()).getErrorMessage().equals("Unknown message format or bad session!")) {
            throw new Exception("error code/ not Unknown message format or bad session!");
        }

        

    }
    
    
    public void testToSyncData() throws Exception {

        //Normal sync
        int last_id = Factory.getInstance().getTransactionDAO().getLastForTransportId(1).getId().getId();
        Message mes = new Message(Message.MessageTypes.start_sync);
        ((DataStart) mes.getData()).setTransportId(1);
        Message answer = serv.answer(mes);

        if (!answer.getType().equals(accept_sync)) {
            throw new Exception("error type normal. type is "+answer.getType());
        }
        if (((DataAccept) answer.getData()).getLastTransactionId() != last_id) {
            throw new Exception("error last id");
        }
        
        
        
        SyncSession ses = mes.getSession();
        mes = new Message(Message.MessageTypes.send_data);
        mes.setSession(ses);
        ArrayList<Transaction> list = new ArrayList<Transaction>();
        
        for(int i=1; i<9; i++){
            Transaction t = new Transaction();
            t.getId().setId(last_id+i);
            t.getId().setTransportId(1);
            t.setTransactionId(UUID.randomUUID());
            t.setCardId(999999999);
            t.setCardType(1);
            t.setPaymentAmount(1200);
            t.setRoute((Route) Factory.getInstance().getEntityDAO().getById(Route.class, 1));
            t.setStation((Station) Factory.getInstance().getEntityDAO().getById(Station.class, 1));
            t.setTime(new Timestamp(System.currentTimeMillis()));
            t.setTransport((Transport) Factory.getInstance().getEntityDAO().getById(Transport.class, 1));
            
            list.add(t);
        }      
        
        
        ((DataSended) mes.getData()).setTransactions(list);
        answer = serv.answer(mes);

        if (!answer.getType().equals(sync_status)) {
            throw new Exception("error type normal. type is "+answer.getType());
        }
        if (((DataStatus) answer.getData()).getCode() !=200) {
            throw new Exception("error code = "+((DataStatus) answer.getData()).getCode() + ": "+((DataStatus) answer.getData()).getErrorMessage());
        }

        

        

    }

}
