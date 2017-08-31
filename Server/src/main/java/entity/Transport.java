/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package entity;


import java.util.List;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import org.apache.log4j.Logger;

/**
 *
 * @author ksinn
 */
public class Transport {
    
    private int id;
    @NotNull
    @Size(min=10, max=10, message="Name must be 10 characters long.")
    @Pattern(regexp="^[A-Z0-9]+$", message="Name must consist from alphabet in upper case and number characters only.")
    private String govNumber;
    @NotNull
    private List<RouteAssociation> routes;
    @NotNull
    private int type;
    @NotNull
    private List<DriverAssociation> drivers;
    private Driver curentDriver;
    private Route curentRoute;
    
    private static final Logger log = Logger.getLogger(Transport.class.getName());
    
    public  int getId(){ return this.id; }
    public  String getGovNumber(){ return this.govNumber; }
    public  List<RouteAssociation> getRoutesHistory(){ return this.routes; }
    public  int getType(){ return this.type; }
    public  List<DriverAssociation> getDriversHistory(){ return this.drivers; }
    public void setId( int id){ this.id = id; }
    public void setGovNumber( String govNumber){ this.govNumber = govNumber; }
    public void setRoutesHistory( List<RouteAssociation> routes){ this.routes = routes; }
    public void setType( int type){ this.type = type; }
    public void setDriversHistory( List<DriverAssociation> drivers){ this.drivers = drivers; }
    
    public Driver getDriver(){ return curentDriver; }
    public Route getRoute(){ return curentRoute; }
    

}
