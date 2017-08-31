
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
public class TestTransport extends TestCase {
    Factory factory = Factory.getInstance();
   

  public void testToRead() throws Exception {
    Transport t = (Transport) factory.getEntityDAO().getById(Transport.class.getName(), 1);
    if(t.getId() !=1) throw new Exception("error id");
    if(t.getGovNumber()==null||t.getGovNumber().isEmpty()) throw new Exception("error gov number");
    if(t.getType() !=1) throw new Exception("error type");
    if(t.getDriversHistory() == null || t.getDriversHistory().size() !=2 || t.getDriversHistory().get(0).getDriver().getId()!=1) throw new Exception("error drivers");
    if(t.getRoutesHistory() == null || t.getRoutesHistory().size() !=2) throw new Exception("error routes");
  
  }
    
}
