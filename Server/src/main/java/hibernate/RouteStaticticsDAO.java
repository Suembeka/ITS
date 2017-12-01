package hibernate;

/**
 *
 * @author ksinn
 */

import java.sql.SQLException;
import javax.naming.NamingException;
import org.json.JSONArray;
import statictics.Fugure;
import statictics.Statictics;

public interface RouteStaticticsDAO {

    public Fugure getMoneyFugure(int id, long start, long end, long range) throws NamingException, SQLException;

    public Statictics getDate(int id, long start, long end) throws NamingException, SQLException;

    public Fugure getTravelsFugure(int id, long start, long end, long range) throws NamingException, SQLException;  
    
    public JSONArray getMonthinYear(String[] years) throws NamingException, SQLException;

}
