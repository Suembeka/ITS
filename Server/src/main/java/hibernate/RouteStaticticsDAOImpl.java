/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package hibernate;

import java.sql.Array;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import org.json.JSONArray;
import org.json.JSONObject;
import statictics.Fugure;
import statictics.Statictics;

/**
 *
 * @author ksinn
 */
class RouteStaticticsDAOImpl implements RouteStaticticsDAO {

    @Override
    public Fugure getMoneyFugure(int id, long start, long end, long range) throws NamingException, SQLException {

        InitialContext initContext;
        initContext = new InitialContext();
        DataSource ds = (DataSource) initContext.lookup("java:comp/env/jdbc/mysql");

        Connection conn = ds.getConnection();
        PreparedStatement stmt = conn.prepareStatement("select UNIX_TIMESTAMP(time) as time, sum(payment_amount) as money  from transactions where route_id = ? and UNIX_TIMESTAMP(time) between ? and ? group by UNIX_TIMESTAMP(time)/?");
        stmt.setInt(1, id);
        stmt.setLong(2, start);
        stmt.setLong(3, end);
        stmt.setLong(4, range);
        ResultSet rs = stmt.executeQuery();
        Fugure fug = new Fugure();
        while (rs.next()) {
            fug.addPoint(rs.getLong("time"), rs.getLong("money"));
        }
        return fug;
    }

    @Override
    public Statictics getDate(int id, long start, long end) throws NamingException, SQLException {

        InitialContext initContext;
        initContext = new InitialContext();
        DataSource ds = (DataSource) initContext.lookup("java:comp/env/jdbc/mysql");

        Connection conn = ds.getConnection();
        String sql = "select count(distinct card_id) as passangers, (select count(distinct card_id) from transactions) as totalPassangers, \n"
                + "sum(payment_amount) as money, (select sum(payment_amount) from transactions) as totalMoney,\n"
                + "count(*) as traveles, (select count(*) from transactions) as totalTraveles"
                + " from transactions where " + (id == 0 ? "" : " route_id = ? and ") + " UNIX_TIMESTAMP(time) between ? and ?;";
        PreparedStatement stmt = conn.prepareStatement(sql);
        if (id == 0) {
            stmt.setLong(1, start);
            stmt.setLong(2, end);
        } else {
            stmt.setInt(1, id);
            stmt.setLong(2, start);
            stmt.setLong(3, end);
        }

        ResultSet rs = stmt.executeQuery();
        Statictics stat = null;
        if (rs.next()) {
            stat = new Statictics();
            stat.setPassangers(rs.getLong("passangers"));
            stat.setTotalPassangers(rs.getLong("totalPassangers"));
            stat.setMoney(rs.getLong("money"));
            stat.setTraveles(rs.getLong("traveles"));
            stat.setTotalMoney(rs.getLong("totalMoney"));
            stat.setTotalTraveles(rs.getLong("totalTraveles"));
        }
        return stat;
    }

    @Override
    public Fugure getTravelsFugure(int id, long start, long end, long range) throws NamingException, SQLException {
        InitialContext initContext;
        initContext = new InitialContext();
        DataSource ds = (DataSource) initContext.lookup("java:comp/env/jdbc/mysql");

        Connection conn = ds.getConnection();
        PreparedStatement stmt = conn.prepareStatement("select UNIX_TIMESTAMP(time) as time, count(*) as travels  from transactions where route_id = ? and UNIX_TIMESTAMP(time) between ? and ? group by UNIX_TIMESTAMP(time)/?");
        stmt.setInt(1, id);
        stmt.setLong(2, start);
        stmt.setLong(3, end);
        stmt.setLong(4, range);
        ResultSet rs = stmt.executeQuery();
        Fugure fug = new Fugure();
        while (rs.next()) {
            fug.addPoint(rs.getLong("time"), rs.getLong("travels"));
        }
        return fug;
    }

    @Override
    public JSONArray getMonthinYear(String[] years) throws NamingException, SQLException {
        InitialContext initContext;
        initContext = new InitialContext();
        DataSource ds = (DataSource) initContext.lookup("java:comp/env/jdbc/mysql");

        Connection conn = ds.getConnection();
        //Array y = conn.createArrayOf("text", years);
        String s = Arrays.toString(years).replaceAll("\\[", "").replaceAll("\\]", "");
        PreparedStatement stmt = conn.prepareStatement("select year(time) as year, MONTHNAME(time) as month, count(*) as treval \n"
                + "from transactions where year(time) in (" + s + ") \n"
                + "group by year(time), month(time) \n"
                + "order by year, month");
        //stmt.setArray(1, y);
        ResultSet rs = stmt.executeQuery();
        JSONArray ar = new JSONArray();
        while (rs.next()) {
            JSONObject obj = new JSONObject();
            obj.put("month", rs.getString("month"));
            obj.put("year", rs.getString("year"));
            obj.put("value", rs.getString("treval"));
            ar.put(obj);
        }
        return ar;
    }

}
