const express = require('express');
const {db} = require('../server/db')
const router = express.Router();

//get rakers
router.get('/:rakers', verifyToken, async (req, res) => {
  try{
    const raker = await db.query('SELECT * FROM raker;');
    res.status(200).json(raker.rows)
  }
  catch (err) {
    res.status(400).send(err.message);
  }
});

//get rakerid
router.get('/rakers/:rakerid', verifyToken, async (req, res) => {
  try{
    const rakerid = await db.query('SELECT * FROM raker WHERE raker_id = $(rakerid);');
    res.status(200).json(raker.rows)
  }
  catch (err) {
    res.status(400).send(err.message);
  }
});

//get rakers from serverid
router.get('/survey/:surveyid/rakers', verifyToken, async (req, res)=>{
  try{
    const rakers = await db.query('SELECT * FROM raker WHERE survey_id = $(surveyid)');
    res.status(200).json(raker.rows)
  }
  catch (err){
    res.status(400).send(err.message);
  }
});

//create raker
router.post('/rakers', verifyToken, async (req, res)=>{
  try{
    const {
      raker_id,
      survey_id,
      raker_name,
      start_lat,
      start_long,
      start_time,
      end_time,
      end_lat,
      end_long,
      start_depth,
      end_depth,
      start_slope,
      end_slope,
      rake_area,
    } = req.body;
  const raker = await db.query(
    `INSERT INTO survey (
      ${raker_id ? 'raker_id, ' : ''}
      ${survey_id ? 'survey_id, ' : ''}
      ${raker_name ? 'raker_name, ' : ''}
      ${start_lat ? 'start_lat, ' : ''}
      ${start_long ? 'start_long, ' : ''}
      ${start_time ? 'start_time, ' : ''}
      ${end_time ? 'end_time, ' : ''}
      ${end_lat ? 'end_lat, ' : ''}
      ${end_long ? 'end_long, ' : ''}
      ${start_depth ? 'start_depth, ' : ''}
      ${end_depth ? 'end_depth, ' : ''}
      ${start_slope ? 'start_slop, ' : ''}
      ${end_slope ? 'end_slope, ' : ''}
      ${rake_area ? 'rake_area, ' : ''}
      status
      )
    VALUES (
      ${raker_id ? '$(raker_id), ' : ''}
      ${survey_id ? '$(survey_id), ' : ''}
      ${raker_name ? '$(raker_name), ' : ''}
      ${start_lat ? '$(start_lat), ' : ''}
      ${start_long ? '$(start_long), ' : ''}
      ${start_time ? '$(start_time), ' : ''}
      ${end_time ? '$(end_time), ' : ''}
      ${end_lat ? '$(end_lat), ' : ''}
      ${end_depth ? '$(end_depth), ' : ''}
      ${start_slope ? '$(start_slope), ' : ''}
      ${end_slope ? '$(end_slope), ' : ''}
      ${start_slope ? '$(start_slope), ' : ''}
      ${end_slope ? '$(end_slope), ' : ''}
      ${rake_area ? '$(rake_are), ' : ''}
      $(status)
    )
    RETURNING *;`,
      {
        raker_id,
        survey_id,
        raker_name,
        start_lat,
        start_long,
        start_time,
        end_time,
        end_lat,
        end_long,
        start_depth,
        end_depth,
        start_slope,
        end_slope,
        rake_area,
      },
    );
    res.status(200).json(raker.rows);
  }
  catch (err) {
    res.status(400).send(err.message);
  }
})

//delete raker
router.delete('/rakers/:rakerid',verifyToken, async (req, res)=>{
  try{
    const { raker_id } = req.params;
    const deletedRaker = await db.query(
      `DELETE from raker WHERE raker_id = $(rakerid) RETURNING *;`,
      { raker_id },
    );
    res.status(200).json(raker.rows);
  }
  catch (err) {
    res.status(400).send(err.message);
  }
})

//update raker
router.put('/rakers/:rakerid', verifyToken, async (req, res)=>{
  try{
    const { raker_Id } = req.params;
    const {
      raker_id,
      survey_id,
      raker_name,
      start_lat,
      start_long,
      start_time,
      end_time,
      end_lat,
      end_long,
      start_depth,
      end_depth,
      start_slope,
      end_slope,
      rake_area,
    } = req.body;
    const updatedFurniture = await db.query(
      `UPDATE raker
         SET
          ${raker_id ? 'raker_id, ' : ''}
          ${survey_id ? 'survey_id, ' : ''}
          ${raker_name ? 'raker_name, ' : ''}
          ${start_lat ? 'start_lat, ' : ''}
          ${start_long ? 'start_long, ' : ''}
          ${start_time ? 'start_time, ' : ''}
          ${end_time ? 'end_time, ' : ''}
          ${end_lat ? 'end_lat, ' : ''}
          ${end_long ? 'end_long, ' : ''}
          ${start_depth ? 'start_depth, ' : ''}
          ${end_depth ? 'end_depth, ' : ''}
          ${start_slope ? 'start_slop, ' : ''}
          ${end_slope ? 'end_slope, ' : ''}
          ${rake_area ? 'rake_area, ' : ''}
        WHERE raker_id = $(rakerid)
        RETURNING *`,
      {
        raker_id,
        survey_id,
        raker_name,
        start_lat,
        start_long,
        start_time,
        end_time,
        end_lat,
        end_long,
        start_depth,
        end_depth,
        start_slope,
        end_slope,
        rake_area,
      },
    );
    res.status(200).json(updatedFurniture.rows);
  }
  catch (err) {
    res.status(400).send(err.message)
  }
})

