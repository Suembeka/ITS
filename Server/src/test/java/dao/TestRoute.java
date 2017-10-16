package dao;


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
    private int id;
   

  public void testToRead() throws Exception {
    Route rout = (Route) factory.getEntityDAO().getById(Route.class, 1);
    if(rout.getName()==null||rout.getName().isEmpty())
        throw new Exception("error name"); 
    if(rout.getAssociations()==null)
        throw new Exception("error stations");
   
    
  
  }
  
  /*public void testToWrite() throws Exception {
    Route rout = new Route();
    rout.setName("test");
    rout.setType(9);
    factory.getEntityDAO().add(rout);
    id = rout.getId();
  }
  
  public void testToUpdate() throws Exception {
    Route rout = (Route) factory.getEntityDAO().getById(Route.class, id);
    if(!rout.getName().equals("test")||rout.getType()!=1)
        throw new Exception("Не соответствуют"); 
    rout.setName("test1");
    factory.getEntityDAO().update(rout.getId(), rout);
    factory.getEntityDAO().delete(rout);
  }
  
  public void testToDelete() throws Exception {
    int type;
    Route rout = new Route();
    rout.setName("test");
    rout.setType(1);
    factory.getEntityDAO().add(rout);
    rout = (Route) factory.getEntityDAO().getById(Route.class, rout.getId());
    if(!rout.getName().equals("test")||rout.getType()!=1)
        throw new Exception("Не соответствуют"); 
    rout.setName("test1");
    factory.getEntityDAO().update(rout.getId(), rout);
    factory.getEntityDAO().delete(rout);
  }*/
    
}
