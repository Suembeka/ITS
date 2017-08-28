
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
public class TestStationAssociation extends TestCase {
    Factory factory = Factory.getInstance();
   

  public void testToCRUD() throws Exception {
      StationAssociation as = (StationAssociation) factory.getEntityDAO().getAll(StationAssociation.class.getName()).toArray()[0];
      if(as.getRoute() == null) throw new Exception("Route is null");
      if(as.getStation() == null) throw new Exception("Station is null");

    Route r = (Route) factory.getEntityDAO().getAll(Route.class.getName()).toArray()[0];
    Station s = (Station) factory.getEntityDAO().getAll(Station.class.getName()).toArray()[0];
    r.addStation(s, 10);
    factory.getEntityDAO().update(r.getId(), r);
    
    factory.getEntityDAO().delete((StationAssociation)r.getAssociations().toArray()[r.getAssociations().size()-1]);

  }
    
}
