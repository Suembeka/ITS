
import entity.*;
import hibernate.Factory;
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
   

  public void testToRead() throws Exception {
      
    TransactionId id = new TransactionId();
    id.setId(1);
    id.setTransportId(1);
    Transaction t = factory.getTransactionDAO().getById(id);
    

    if(t.getId() == null || t.getId().getTransportId() !=1 || t.getId().getId() !=1) throw new Exception("error comp id");
    /*if(t.getCardId() == 0) throw new Exception("error card id");
    if(t.getCardType() !=1) throw new Exception("error type");
    if(t.getRoute() == null || t.getRoute().getId() !=1) throw new Exception("error route");
    if(t.getStation() == null || t.getStation().getId() !=1) throw new Exception("error station");
    if(t.getTransport() == null || t.getTransport().getId() !=1) throw new Exception("error transport");
    if(t.getPaymentAmount() != 1200) throw new Exception("error payment");
    if(t.getTime() != null) throw new Exception("error time");
    if(t.getTransport() != null || t.getTransport().getId() != 1) throw new Exception("error transport");
*/
}
    
}
