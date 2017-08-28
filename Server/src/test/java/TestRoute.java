
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
public class TestRoute extends TestCase {
    Factory factory = Factory.getInstance();
   

  public void testToCRUD() throws Exception {
    int type;
    Route rout = new Route();
    rout.setName("test");
    rout.setType((RouteType) factory.getEntityDAO().getAll(RouteType.class.getName()).toArray()[0]);
    type = rout.getType().getId();
    factory.getEntityDAO().add(rout);
    rout = (Route) factory.getEntityDAO().getById(Route.class.getName(), rout.getId());
    if(!rout.getName().equals("test")||rout.getType().getId()!=type)
        throw new Exception("Не соответствуют"); 
    rout.setName("test1");
    factory.getEntityDAO().update(rout.getId(), rout);
    factory.getEntityDAO().delete(rout);
  }
    
}
