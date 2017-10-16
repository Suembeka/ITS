package dao;

import entity.*;
import hibernate.Factory;
import java.sql.SQLException;
import junit.framework.TestCase;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author ksinn
 */
public class TestTransaction extends TestCase {

    Factory factory = Factory.getInstance();

    
    private void entityTest(Transaction t, TransactionId id) throws Exception{
        if (t.getTransactionId() == null) {
            throw new Exception("error transactionId");
        }
        if (t.getId() == null || t.getId().getTransportId() != id.getTransportId() || t.getId().getId() != id.getId()) {
            throw new Exception("error comp id");
        }
        if (t.getCardId() == 0) {
            throw new Exception("error card id");
        }
        if (t.getCardType() != 1) {
            throw new Exception("error type");
        }
        if (t.getRoute() == null || t.getRoute().getId() != 1) {
            throw new Exception("error route");
        }
        if (t.getStation() == null || t.getStation().getId() != 1) {
            throw new Exception("error station");
        }
        if (t.getTransport() == null || t.getTransport().getId() != 1) {
            throw new Exception("error transport");
        }
        if (t.getPaymentAmount() != 1200) {
            throw new Exception("error payment");
        }
        if (t.getTime() == null) {
            throw new Exception("error time");
        }
    }
    
    public void testToGetLast() throws Exception{
        
        Transaction t = factory.getTransactionDAO().getLastForTransportId(1);
        TransactionId id = new TransactionId();
        id.setId(99);
        id.setTransportId(1);
        
        //entityTest(t, id);
        
    }
    
    public void testToRead() throws Exception {

        TransactionId id = new TransactionId();
        id.setId(1);
        id.setTransportId(1);
        Transaction t = factory.getTransactionDAO().getById(id);
        
        entityTest(t, id);
        

    }
    /*
  public void testToWrite() throws Exception {
      
    TransactionId id = new TransactionId();
    id.setId(99);
    id.setTransportId(1);
    Transaction t = new Transaction();
    t.setId(id);
    t.setCardId(1265134578);
    t.setCardType(9);
    t.setPaymentAmount(1200);
    t.setRoute((Route) factory.getEntityDAO().getById(Route.class.getName(), 1));
    t.setStation((Station) factory.getEntityDAO().getById(Station.class.getName(), 1));
    t.setTime(new Timestamp(System.currentTimeMillis()));
    t.setTransport((Transport) factory.getEntityDAO().getById(Transport.class.getName(), 1));
    t.setTransactionId(UUID.randomUUID());
    factory.getTransactionDAO().add(t);
}
     */

}
