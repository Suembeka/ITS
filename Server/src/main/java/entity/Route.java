/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;

import hibernate.Factory;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class Route {
    
    private int id;
    @NotNull
    @Size(min=1, max=5, message="Name must be between 1 and 5 characters long.")
    @Pattern(regexp="^[a-zA-Z0-9 ]+$", message="Name must consist from alphabet, numiracle and space characters only.")
    private String name;
    @NotNull
    private RouteType type;
    private Set<StationAssociation> stations;
    
    private static final Logger log = Logger.getLogger(Route.class.getName());
    
    {
        stations = new HashSet();
    }
    
    public int getId(){return id;}
    public String getName(){return name;}
    public RouteType getType(){return type;}
    public Set<StationAssociation> getAssociations(){ return stations; }
    public void setId(int id){this.id = id;}
    public void setName(String name){this.name = name;}
    public void setType(RouteType type){this.type = type;}
    public void setAssociations(Set<StationAssociation>  stations){ this.stations = stations; }
    
    public void addStation(Station station, int order) throws SQLException{ 
        StationAssociation association = new StationAssociation();
        association.setRoute(this);
        association.setStation(station);
        association.setStationByOrder(order);
        try {
            Factory.getInstance().getEntityDAO().add(association);
        } catch (SQLException ex) {
            log.error("Can not add association :(", ex);
            throw ex;
        }
        stations.add(association); 
    }
    
}
