
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
public class TestRouteType extends TestCase {
    Factory factory = Factory.getInstance();
   

  public void testToCRUD() throws Exception {
    RouteType rType = new RouteType();
    rType.setName("avtobus");
    rType.setPaymentAmount(1200);
    factory.getEntityDAO().add(rType); 
    rType = (RouteType) factory.getEntityDAO().getById(RouteType.class.getName(), rType.getId());
    if(!rType.getName().equals("avtobus")||rType.getPaymentAmount()!=1200)
        throw new Exception("Не соответствуют"); 
    rType.setName("avtobus_new");
    rType.setPaymentAmount(1300);
    factory.getEntityDAO().update(rType.getId(), rType);
    factory.getEntityDAO().delete(rType);
    factory.getEntityDAO().getAll(RouteType.class.getName());
  }
    
}
