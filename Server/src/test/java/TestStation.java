
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
public class TestStation extends TestCase {
    Factory factory = Factory.getInstance();
   

  public void testToCRUD() throws Exception {
    int type;
    Station st = new Station();
    st.setName("test");
    st.setLatlng("1312156");
    st.setType((StationType) factory.getEntityDAO().getAll(StationType.class.getName()).toArray()[0]);
    type = st.getType().getId();
    factory.getEntityDAO().add(st);
    st = (Station) factory.getEntityDAO().getById(Station.class.getName(), st.getId());
    if(!st.getName().equals("test")||st.getType().getId()!=type)
        throw new Exception("Не соответствуют"); 
    st.setName("test1");
    factory.getEntityDAO().update(st.getId(), st);
    factory.getEntityDAO().delete(st);
  }
    
}
