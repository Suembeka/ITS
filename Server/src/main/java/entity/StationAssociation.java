/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import javax.validation.constraints.NotNull;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class StationAssociation {
    
    private int id;
    @NotNull
    private int stationByOrder;
    @NotNull
    private Route route;
    @NotNull
    private Station station;
    
    private static final Logger log = Logger.getLogger(StationAssociation.class.getName());
    
    public  int getId(){ return this.id; }
    public  int getStationByOrder(){ return this.stationByOrder; }
    public  Route getRoute(){ return this.route; }
    public  Station getStation(){ return this.station; }
    public void setId( int id){ this.id = id; }
    public void setStationByOrder( int stationByOrder){ this.stationByOrder = stationByOrder; }
    public void setRoute(Route route){ this.route = route; }
    public void setStation(Station station){ this.station = station; }
    
  
}
